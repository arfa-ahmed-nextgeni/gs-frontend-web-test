import "server-only";

import {
  ApiActivityFeatures,
  ApiActivityServices,
} from "@/lib/api-activity/api-activity-meta";
import { loggedFetch } from "@/lib/api-activity/fetch/logged-fetch";
import {
  OPERATIONS_API_SECRET,
  OPERATIONS_BASE_URL,
} from "@/lib/config/server-env";
import { API_CONSTANTS, HEADERS } from "@/lib/constants/api";

export async function operationsApiRequest<T>({
  body,
  endpoint,
  options,
}: {
  body?: unknown;
  endpoint: string;
  options?: RequestInit;
}): Promise<{ data: T; status: number }> {
  const url = `${OPERATIONS_BASE_URL}${endpoint}`;

  const headers = new Headers();
  headers.set(HEADERS.ACCEPT, "application/json");
  headers.set(HEADERS.CONTENT_TYPE, "application/json");
  headers.set(HEADERS.API_SECRET, OPERATIONS_API_SECRET);

  const response = await loggedFetch(
    url,
    {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
      headers,
      method: options?.method || "POST",
      signal: AbortSignal.timeout(API_CONSTANTS.DEFAULT_TIMEOUT),
    },
    {
      feature: ApiActivityFeatures.Operations,
      initiator: "src/lib/clients/operations.ts#operationsApiRequest",
      service: ApiActivityServices.Operations,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Operations API error: ${response.status} - ${errorText || response.statusText}`
    );
  }

  const data = (await response.json()) as T;
  return { data, status: response.status };
}
