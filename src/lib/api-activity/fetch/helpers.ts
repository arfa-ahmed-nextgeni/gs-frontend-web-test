import {
  getApiActivityFeatureState,
  isApiActivityLoggingEnabled,
} from "@/lib/api-activity/api-activity-config";
import { redactUrl } from "@/lib/api-activity/api-activity-redaction";
import {
  API_ACTIVITY_FETCH_ROUTE_PREFIXES,
  API_ACTIVITY_TEXT_CONTENT_TYPE_SNIPPETS,
} from "@/lib/api-activity/fetch/constants";

import type { ApiActivityHeader } from "@/lib/api-activity/api-activity-types";
import type {
  LoggedFetchLegacyArgs,
  LoggedFetchMeta,
  NormalizedLoggedFetchArgs,
} from "@/lib/api-activity/fetch/types";

export function getDurationMs(startedAtPerformance: number) {
  return Math.max(0, Math.round(performance.now() - startedAtPerformance));
}

export function getMaxBodyBytes() {
  return getApiActivityFeatureState().maxBodyBytes;
}

export function getMergedHeaders(input: RequestInfo | URL, init?: RequestInit) {
  const mergedHeaders = new Headers(
    input instanceof Request ? input.headers : undefined
  );

  if (init?.headers) {
    const initHeaders = new Headers(init.headers);

    for (const [name, value] of initHeaders.entries()) {
      mergedHeaders.set(name, value);
    }
  }

  return mergedHeaders;
}

export function getMethod(input: RequestInfo | URL, init?: RequestInit) {
  const requestMethod = input instanceof Request ? input.method : undefined;

  return (init?.method ?? requestMethod ?? "GET").toUpperCase();
}

export function getStartedAt({
  durationMs,
  endedAt,
}: {
  durationMs: number;
  endedAt: string;
}) {
  const endedAtMs = Date.parse(endedAt);

  if (Number.isNaN(endedAtMs)) {
    return endedAt;
  }

  return new Date(endedAtMs - durationMs).toISOString();
}

export function getUrlString(input: RequestInfo | URL) {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}

export function isTextLikeContentType(contentType: null | string) {
  const normalizedContentType = contentType?.toLowerCase() ?? "";

  return API_ACTIVITY_TEXT_CONTENT_TYPE_SNIPPETS.some((snippet) =>
    normalizedContentType.includes(snippet)
  );
}

export function normalizeLoggedFetchArgs(
  inputOrArgs: LoggedFetchLegacyArgs | RequestInfo | URL,
  init?: RequestInit,
  meta?: LoggedFetchMeta
): NormalizedLoggedFetchArgs {
  if (isLoggedFetchLegacyArgs(inputOrArgs)) {
    const { action, feature, initiator, service, ...request } = inputOrArgs;

    return {
      ...request,
      meta: {
        action,
        feature,
        initiator,
        service,
      },
    };
  }

  return {
    init,
    input: inputOrArgs,
    meta: meta ?? {},
  };
}

export function normalizeMetaValue<T extends string>(
  value: null | T | undefined
) {
  const normalizedValue = value?.trim();

  return normalizedValue ? (normalizedValue as T) : null;
}

export function redactUrlString(url: string) {
  const parsedUrl = tryCreateUrl(url);

  return parsedUrl ? redactUrl(parsedUrl) : url;
}

export function safelyCloneResponse(response: Response) {
  if (!shouldCaptureResponsePreview(response)) {
    return null;
  }

  try {
    return response.clone();
  } catch (error) {
    console.error("[api-activity] Failed to clone response.", error);
    return null;
  }
}

export function scheduleApiActivityTask(task: () => Promise<void> | void) {
  queueMicrotask(() => {
    void Promise.resolve()
      .then(task)
      .catch((error) => {
        console.error("[api-activity] Failed to record activity.", error);
      });
  });
}

export function shouldCaptureResponsePreview(response: Response) {
  return (
    Boolean(response.body) &&
    isTextLikeContentType(response.headers.get("content-type"))
  );
}

export function shouldLogRequest(input: RequestInfo | URL) {
  return (
    isApiActivityLoggingEnabled() && !isApiActivityRoute(getUrlString(input))
  );
}

export function toHeaderEntries(headers: Headers) {
  return Array.from(headers.entries()).map<ApiActivityHeader>(
    ([name, value]) => ({
      name,
      value,
    })
  );
}

export function truncateTextByBytes(text: string, maxBytes: number) {
  const buffer = Buffer.from(text, "utf8");

  if (buffer.length <= maxBytes) {
    return {
      previewSize: buffer.length,
      size: buffer.length,
      text,
      truncated: false,
    };
  }

  const previewBuffer = buffer.subarray(0, maxBytes);

  return {
    previewSize: previewBuffer.length,
    size: buffer.length,
    text: previewBuffer.toString("utf8"),
    truncated: true,
  };
}

export function tryCreateUrl(url: string, base?: string) {
  try {
    return base ? new URL(url, base) : new URL(url);
  } catch {
    return null;
  }
}

function isApiActivityRoute(url: string) {
  const parsedUrl = tryCreateUrl(url, "http://api-activity.local");

  if (!parsedUrl) {
    return false;
  }

  return API_ACTIVITY_FETCH_ROUTE_PREFIXES.some((pathname) =>
    parsedUrl.pathname.startsWith(pathname)
  );
}

function isLoggedFetchLegacyArgs(
  value: LoggedFetchLegacyArgs | RequestInfo | URL
): value is LoggedFetchLegacyArgs {
  return typeof value === "object" && value !== null && "input" in value;
}
