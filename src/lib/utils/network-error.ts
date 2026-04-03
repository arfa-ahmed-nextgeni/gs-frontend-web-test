export function createTimeoutError(): Error {
  const timeoutError = new Error("timeoutError");
  timeoutError.name = "TimeoutError";
  return timeoutError;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

/**
 * Detects if an error is a network-related error (no internet, connection issues, etc.)
 */
export function isNetworkError(error: unknown): boolean {
  if (typeof window === "undefined") {
    // Server-side: check error types
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes("failed to fetch") ||
        message.includes("networkerror") ||
        message.includes("network request failed") ||
        message.includes("network error") ||
        message.includes("connection") ||
        error.name === "TypeError" ||
        error.name === "NetworkError"
      );
    }
    return false;
  }

  // Client-side: check navigator.onLine and error types
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return true;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Common network error patterns
    return (
      message.includes("failed to fetch") ||
      message.includes("networkerror") ||
      message.includes("network request failed") ||
      message.includes("network error") ||
      message.includes("connection") ||
      message.includes("err_network") ||
      message.includes("err_internet_disconnected") ||
      error.name === "TypeError" ||
      error.name === "NetworkError"
    );
  }

  return false;
}

/**
 * Determines if an error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("timeout") ||
      message.includes("timed out") ||
      error.name === "TimeoutError"
    );
  }
  return false;
}
