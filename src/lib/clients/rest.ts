import "server-only";

import {
  ApiActivityFeatures,
  ApiActivityServices,
} from "@/lib/api-activity/api-activity-meta";
import { loggedFetch } from "@/lib/api-activity/fetch/logged-fetch";
import { REST_BASE_URL } from "@/lib/config/client-env";
import { API_CONSTANTS, HEADERS } from "@/lib/constants/api";
import { StoreCode } from "@/lib/constants/i18n";

export async function restRequest<T>({
  authToken,
  endpoint,
  options,
  requestInit,
  storeCode,
}: {
  authToken?: string;
  endpoint: string;
  isGuest?: boolean;
  options?: RequestInit;
  requestInit?: RequestInit;
  storeCode?: StoreCode;
}): Promise<{ data: T; status: number }> {
  const url = storeCode
    ? `${REST_BASE_URL}/${storeCode}/V1${endpoint}`
    : `${REST_BASE_URL}/V1${endpoint}`;

  const headers = new Headers();

  headers.set(HEADERS.CONTENT_TYPE, "application/json");
  headers.set(HEADERS.X_PLATFORM, "web");
  if (authToken) headers.set(HEADERS.AUTHORIZATION, `Bearer ${authToken}`);

  const response = await loggedFetch(
    url,
    {
      ...options,
      headers,
      signal: AbortSignal.timeout(API_CONSTANTS.DEFAULT_TIMEOUT),
      ...requestInit,
    },
    {
      feature: ApiActivityFeatures.Storefront,
      initiator: "src/lib/clients/rest.ts#restRequest",
      service: ApiActivityServices.Rest,
    }
  );

  const contentType = response.headers.get("content-type");

  // Get response as text first to validate it's JSON
  const responseText = await response.text();

  // Check if response is JSON before parsing
  if (contentType?.includes("application/json")) {
    try {
      const data = JSON.parse(responseText) as T;
      return { data, status: response.status };
    } catch (parseError) {
      console.error(
        "[restRequest] Failed to parse JSON response:",
        parseError instanceof Error ? parseError.message : String(parseError),
        responseText.substring(0, 500)
      );
      throw new Error(
        `Invalid JSON response from REST API: ${parseError instanceof Error ? parseError.message : "Parse error"}. Response preview: ${responseText.substring(0, 200)}`
      );
    }
  } else {
    // Non-JSON response (likely XML error page or HTML)
    console.error("[restRequest] Non-JSON response:", {
      contentType,
      responsePreview: responseText.substring(0, 500),
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

    // For other errors, throw with status information
    throw new Error(
      `Unexpected response from REST API (${response.status} ${response.statusText}): ${contentType}. Expected JSON but received ${contentType || "unknown content type"}.`
    );
  }
}
