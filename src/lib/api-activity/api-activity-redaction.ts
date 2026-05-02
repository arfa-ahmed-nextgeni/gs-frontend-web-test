import "server-only";

import { isApiActivityRedactionEnabled } from "@/lib/api-activity/api-activity-config";

import type {
  ApiActivityHeader,
  ApiActivityQueryParam,
} from "@/lib/api-activity/api-activity-types";

const REDACTED_VALUE = "[REDACTED]";
const REDACTED_CARD_VALUE = "[REDACTED_CARD]";
const SENSITIVE_KEY_PATTERN =
  /(authorization|password|passcode|passwd|secret|token|api[_-]?key|api[_-]?secret|signature|cookie|session|cvv|cvc|card(?:[_-]?number)?|card[_-]?security[_-]?code|access[_-]?code|merchant_identifier|set-cookie)/i;
const CARD_NUMBER_PATTERN = /\b(?:\d[ -]*?){13,19}\b/g;

export function redactHeaderEntries(headers: ApiActivityHeader[]) {
  if (!isApiActivityRedactionEnabled()) {
    return headers;
  }

  return headers.map((header) => ({
    name: header.name,
    value: isSensitiveKey(header.name)
      ? REDACTED_VALUE
      : redactInlineSecrets(header.value),
  }));
}

export function redactQueryParams(searchParams: URLSearchParams) {
  if (!isApiActivityRedactionEnabled()) {
    return Array.from(searchParams.entries()).map<ApiActivityQueryParam>(
      ([key, value]) => ({
        key,
        value,
      })
    );
  }

  return Array.from(searchParams.entries()).map<ApiActivityQueryParam>(
    ([key, value]) => ({
      key,
      value: isSensitiveKey(key) ? REDACTED_VALUE : redactInlineSecrets(value),
    })
  );
}

export function redactTextBody({
  contentType,
  preview,
}: {
  contentType: null | string;
  preview: string;
}) {
  if (!isApiActivityRedactionEnabled()) {
    return preview;
  }

  const normalizedContentType = contentType?.toLowerCase() ?? "";

  if (normalizedContentType.includes("application/json")) {
    try {
      const parsed = JSON.parse(preview) as unknown;
      return JSON.stringify(redactStructuredValue(parsed), null, 2);
    } catch {
      return redactInlineSecrets(preview);
    }
  }

  if (normalizedContentType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(preview);

    for (const [key, value] of params.entries()) {
      params.set(
        key,
        isSensitiveKey(key) ? REDACTED_VALUE : redactInlineSecrets(value)
      );
    }

    return params.toString();
  }

  return redactInlineSecrets(preview);
}

export function redactUrl(url: URL) {
  if (!isApiActivityRedactionEnabled()) {
    return url.toString();
  }

  const clonedUrl = new URL(url.toString());

  clonedUrl.search = "";
  for (const [key, value] of url.searchParams.entries()) {
    clonedUrl.searchParams.append(
      key,
      isSensitiveKey(key) ? REDACTED_VALUE : redactInlineSecrets(value)
    );
  }

  return clonedUrl.toString();
}

function isSensitiveKey(key: string) {
  return SENSITIVE_KEY_PATTERN.test(key);
}

function redactInlineSecrets(value: string) {
  return value
    .replace(CARD_NUMBER_PATTERN, REDACTED_CARD_VALUE)
    .replace(
      /((?:password|passcode|token|secret|api[_-]?key|api[_-]?secret|signature|cvv|cvc|card(?:[_-]?number)?|card[_-]?security[_-]?code|access[_-]?code|merchant_identifier|authorization)\s*[:=]\s*)("[^"]*"|'[^']*'|[^,\s&]+)/gi,
      `$1${REDACTED_VALUE}`
    );
}

function redactStructuredValue(value: unknown, key?: string): unknown {
  if (key && isSensitiveKey(key)) {
    return REDACTED_VALUE;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactStructuredValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        redactStructuredValue(entryValue, entryKey),
      ])
    );
  }

  if (typeof value === "string") {
    return redactInlineSecrets(value);
  }

  return value;
}
