import { isNetworkError, isTimeoutError } from "@/lib/utils/network-error";

type CommonErrorKey =
  | "backendUnavailable"
  | "networkError"
  | "timeoutError"
  | "unknownError";

type CommonErrorsTranslator = (key: CommonErrorKey) => string;

export function getCommonErrorMessage({
  error,
  fallbackMessage,
  tCommonErrors,
}: {
  error: unknown;
  fallbackMessage?: string;
  tCommonErrors: CommonErrorsTranslator;
}): string {
  if (isTimeoutError(error)) {
    return tCommonErrors("timeoutError");
  }

  if (isNetworkError(error)) {
    return tCommonErrors("networkError");
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("503") ||
      message.includes("service unavailable") ||
      message.includes("bad gateway") ||
      message.includes("gateway timeout") ||
      message.includes("econnrefused")
    ) {
      return tCommonErrors("backendUnavailable");
    }
  }

  return fallbackMessage ?? tCommonErrors("unknownError");
}
