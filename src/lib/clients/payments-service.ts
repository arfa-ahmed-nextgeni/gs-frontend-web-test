import { headers } from "next/headers";

import {
  PAYMENTS_API_KEY,
  PAYMENTS_SERVICE_BASE_URL,
} from "@/lib/config/server-env";
import { API_CONSTANTS, HEADERS } from "@/lib/constants/api";

export async function paymentsServiceRequest<T>({
  authToken,
  endpoint,
  options,
}: {
  authToken?: string;
  endpoint: string;
  options?: RequestInit;
}): Promise<{ data: T; status: number }> {
  const url = `${PAYMENTS_SERVICE_BASE_URL}${endpoint}`;

  const requestHeaders = new Headers();

  requestHeaders.set(HEADERS.CONTENT_TYPE, "application/json");
  requestHeaders.set(HEADERS.X_PLATFORM, "web");

  // Forward browser User-Agent when available on the server
  try {
    const nextHeaders = await headers();
    const userAgent = nextHeaders.get("user-agent");
    if (userAgent) {
      requestHeaders.set(HEADERS.USER_AGENT, userAgent);
    }
  } catch {
    // Ignore if not in a server context
  }

  if (!PAYMENTS_API_KEY) {
    console.error(
      "[paymentsServiceRequest] PAYMENTS_API_KEY is not set in environment variables"
    );
    throw new Error("Payments API key is not configured");
  }

  requestHeaders.set(HEADERS.API_SECRET, PAYMENTS_API_KEY);

  if (authToken) {
    requestHeaders.set(HEADERS.AUTHORIZATION, `Bearer ${authToken}`);
  }

  const response = await fetch(url, {
    ...options,
    headers: requestHeaders,
    signal: AbortSignal.timeout(API_CONSTANTS.DEFAULT_TIMEOUT),
  });

  let data: T;
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      console.error(
        "[paymentsServiceRequest] Failed to parse JSON response:",
        text.substring(0, 500)
      );
      throw new Error(
        `Invalid JSON response from Payments Service: ${text.substring(0, 200)}`
      );
    }
  } else {
    // Non-JSON response (likely HTML error page)
    const text = await response.text();
    console.error("[paymentsServiceRequest] Non-JSON response:", {
      contentType,
      responsePreview: text.substring(0, 500),
      status: response.status,
      statusText: response.statusText,
      url,
    });

    // If it's a 404, the endpoint might not exist
    if (response.status === 404) {
      throw new Error(
        `Endpoint not found (404): ${url}. Please verify the endpoint path is correct.`
      );
    }

    // For other errors, try to extract error message from HTML or use status
    throw new Error(
      `Unexpected response from Payments Service (${response.status} ${response.statusText}): ${contentType}. The endpoint may not exist or there's a server error.`
    );
  }

  return { data, status: response.status };
}
