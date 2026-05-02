import {
  redactHeaderEntries,
  redactQueryParams,
  redactTextBody,
  redactUrl,
} from "@/lib/api-activity/api-activity-redaction";
import {
  DEFAULT_API_ACTIVITY_FETCH_INITIATOR,
  DEFAULT_API_ACTIVITY_FETCH_SERVICE,
} from "@/lib/api-activity/fetch/constants";
import {
  getMaxBodyBytes,
  getMergedHeaders,
  getMethod,
  getStartedAt,
  getUrlString,
  isTextLikeContentType,
  normalizeMetaValue,
  redactUrlString,
  toHeaderEntries,
  truncateTextByBytes,
  tryCreateUrl,
} from "@/lib/api-activity/fetch/helpers";

import type {
  ApiActivityBody,
  ApiActivityEntry,
  ApiActivityRequest,
  ApiActivityResponse,
} from "@/lib/api-activity/api-activity-types";
import type { LoggedFetchMeta } from "@/lib/api-activity/fetch/types";

export function createBaseEntry({
  durationMs,
  endedAt,
  meta,
  request,
}: {
  durationMs: number;
  endedAt: string;
  meta: LoggedFetchMeta;
  request: ApiActivityRequest;
}): Omit<ApiActivityEntry, "error" | "id" | "response"> {
  const action = normalizeMetaValue(meta.action);
  const feature = normalizeMetaValue(meta.feature);
  const service =
    normalizeMetaValue(meta.service) ?? DEFAULT_API_ACTIVITY_FETCH_SERVICE;
  const startedAt = getStartedAt({
    durationMs,
    endedAt,
  });

  return {
    action,
    durationMs,
    endedAt,
    feature,
    initiator:
      normalizeMetaValue(meta.initiator) ??
      DEFAULT_API_ACTIVITY_FETCH_INITIATOR,
    request,
    service,
    startedAt,
    target: action ?? deriveTarget(request),
  };
}

export function createRequestSnapshot({
  init,
  input,
}: {
  init?: RequestInit;
  input: RequestInfo | URL;
}): ApiActivityRequest {
  const urlString = getUrlString(input);
  const requestUrl = tryCreateUrl(urlString);
  const headers = getMergedHeaders(input, init);

  return {
    body: createRequestBodySnapshot({
      body: init?.body,
      headers,
    }),
    headers: redactHeaderEntries(toHeaderEntries(headers)),
    method: getMethod(input, init),
    origin: requestUrl?.origin ?? null,
    pathname: requestUrl?.pathname ?? urlString,
    query: requestUrl ? redactQueryParams(requestUrl.searchParams) : [],
    url: requestUrl ? redactUrl(requestUrl) : urlString,
  };
}

export async function createResponseSnapshot({
  response,
  responseClone,
}: {
  response: Response;
  responseClone: null | Response;
}): Promise<ApiActivityResponse> {
  let body: ApiActivityBody | null;

  if (!response.body) {
    body = null;
  } else if (!isTextLikeContentType(response.headers.get("content-type"))) {
    body = await createResponseBodySnapshot(response);
  } else if (!responseClone) {
    body = {
      contentType: response.headers.get("content-type"),
      note: "Body preview unavailable.",
      preview: null,
      previewSize: null,
      totalSize: null,
      truncated: false,
    };
  } else {
    try {
      body = await createResponseBodySnapshot(responseClone);
    } catch {
      body = {
        contentType: response.headers.get("content-type"),
        note: "Body preview unavailable.",
        preview: null,
        previewSize: null,
        totalSize: null,
        truncated: false,
      };
    }
  }

  return {
    body,
    headers: redactHeaderEntries(toHeaderEntries(response.headers)),
    redirected: response.redirected,
    status: response.status,
    statusText: response.statusText,
    url: redactUrlString(response.url),
  };
}

export function safelyCreateRequestSnapshot({
  init,
  input,
}: {
  init?: RequestInit;
  input: RequestInfo | URL;
}) {
  try {
    return createRequestSnapshot({
      init,
      input,
    });
  } catch (error) {
    console.error("[api-activity] Failed to create request snapshot.", error);
    return null;
  }
}

function createRequestBodySnapshot({
  body,
  headers,
}: {
  body: RequestInit["body"];
  headers: Headers;
}): ApiActivityBody | null {
  if (body == null) {
    return null;
  }

  const maxBodyBytes = getMaxBodyBytes();
  const contentType = getDerivedContentType({ body, headers });

  if (body instanceof ReadableStream) {
    return {
      contentType,
      note: "Body omitted for streaming request payload.",
      preview: null,
      previewSize: null,
      totalSize: null,
      truncated: false,
    };
  }

  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    return {
      contentType,
      note: "Body omitted for binary request payload.",
      preview: null,
      previewSize: null,
      totalSize: body.byteLength,
      truncated: false,
    };
  }

  if (body instanceof FormData) {
    const preview = Array.from(body.entries())
      .map(([key, value]) => [
        key,
        typeof value === "string" ? value : `[binary:${value.name}]`,
      ])
      .flat()
      .join("&");
    const truncated = truncateTextByBytes(preview, maxBodyBytes);

    return {
      contentType: contentType ?? "multipart/form-data",
      note: truncated.truncated ? "Preview truncated." : null,
      preview: redactTextBody({
        contentType: contentType ?? "multipart/form-data",
        preview: truncated.text,
      }),
      previewSize: truncated.previewSize,
      totalSize: truncated.size,
      truncated: truncated.truncated,
    };
  }

  if (body instanceof Blob) {
    return {
      contentType,
      note: "Body omitted for Blob request payload.",
      preview: null,
      previewSize: null,
      totalSize: body.size,
      truncated: false,
    };
  }

  const textBody =
    typeof body === "string"
      ? body
      : body instanceof URLSearchParams
        ? body.toString()
        : null;

  if (textBody == null) {
    return {
      contentType,
      note: "Body omitted for unsupported request payload.",
      preview: null,
      previewSize: null,
      totalSize: null,
      truncated: false,
    };
  }

  const truncated = truncateTextByBytes(textBody, maxBodyBytes);

  return {
    contentType,
    note: truncated.truncated ? "Preview truncated." : null,
    preview: redactTextBody({
      contentType,
      preview: truncated.text,
    }),
    previewSize: truncated.previewSize,
    totalSize: truncated.size,
    truncated: truncated.truncated,
  };
}

async function createResponseBodySnapshot(
  response: Response
): Promise<ApiActivityBody | null> {
  const contentType = response.headers.get("content-type");
  const contentLength = response.headers.get("content-length");
  const parsedSize = contentLength ? Number.parseInt(contentLength, 10) : null;

  if (!response.body) {
    return null;
  }

  if (!isTextLikeContentType(contentType)) {
    return {
      contentType,
      note: "Body omitted for non-text response payload.",
      preview: null,
      previewSize: null,
      totalSize: Number.isFinite(parsedSize) ? parsedSize : null,
      truncated: false,
    };
  }

  const previewResult = await readResponsePreview(
    response.body,
    getMaxBodyBytes()
  );

  return {
    contentType,
    note: previewResult.truncated ? "Preview truncated." : null,
    preview: redactTextBody({
      contentType,
      preview: previewResult.preview,
    }),
    previewSize: previewResult.previewSize,
    totalSize: previewResult.totalBytesRead,
    truncated: previewResult.truncated,
  };
}

function deriveTarget(request: ApiActivityRequest) {
  const requestBodyPreview = request.body?.preview;

  if (requestBodyPreview) {
    try {
      const parsedBody = JSON.parse(requestBodyPreview) as {
        operationName?: string;
        query?: string;
      };

      if (parsedBody.operationName) {
        return parsedBody.operationName;
      }

      if (parsedBody.query) {
        const match = parsedBody.query.match(
          /\b(?:query|mutation|subscription)\s+([A-Za-z0-9_]+)/i
        );

        if (match?.[1]) {
          return match[1];
        }
      }
    } catch {
      const match = requestBodyPreview.match(
        /\b(?:query|mutation|subscription)\s+([A-Za-z0-9_]+)/i
      );

      if (match?.[1]) {
        return match[1];
      }
    }
  }

  return request.query.length > 0
    ? `${request.pathname}?${new URLSearchParams(
        request.query.map(({ key, value }) => [key, value])
      ).toString()}`
    : request.pathname;
}

function getDerivedContentType({
  body,
  headers,
}: {
  body: RequestInit["body"];
  headers: Headers;
}) {
  const contentType = headers.get("content-type");

  if (contentType) {
    return contentType;
  }

  if (typeof body === "string") {
    const trimmedBody = body.trim();

    if (
      (trimmedBody.startsWith("{") && trimmedBody.endsWith("}")) ||
      (trimmedBody.startsWith("[") && trimmedBody.endsWith("]"))
    ) {
      return "application/json";
    }
  }

  if (body instanceof URLSearchParams) {
    return "application/x-www-form-urlencoded";
  }

  if (body instanceof Blob && body.type) {
    return body.type;
  }

  return null;
}

async function readResponsePreview(
  stream: ReadableStream<Uint8Array>,
  maxBytes: number
) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let bytesRead = 0;
  let totalBytesRead = 0;
  let truncated = false;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done || !value) {
        break;
      }

      totalBytesRead += value.length;

      if (bytesRead >= maxBytes + 1) {
        truncated = true;
        continue;
      }

      const remaining = maxBytes + 1 - bytesRead;

      if (value.length > remaining) {
        chunks.push(value.subarray(0, remaining));
        bytesRead += remaining;
        truncated = true;
        continue;
      }

      chunks.push(value);
      bytesRead += value.length;
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      // Ignore cancel failures from completed streams.
    }
  }

  const combined = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
  const previewBuffer = truncated ? combined.subarray(0, maxBytes) : combined;

  return {
    bytesRead,
    preview: previewBuffer.toString("utf8"),
    previewSize: previewBuffer.length,
    totalBytesRead,
    truncated,
  };
}
