import "server-only";

import {
  ApiActivityFeatures,
  ApiActivityServices,
} from "@/lib/api-activity/api-activity-meta";
import { loggedFetch } from "@/lib/api-activity/fetch/logged-fetch";
import {
  CHECKOUT_BASE_URL,
  CHECKOUT_PUBLIC_API_KEY,
} from "@/lib/config/server-env";
import { API_CONSTANTS, HEADERS } from "@/lib/constants/api";

export async function checkoutRequest<T>({
  endpoint,
  options,
}: {
  endpoint: string;
  options?: RequestInit;
}): Promise<{ data: T; status: number }> {
  const url = `${CHECKOUT_BASE_URL}${endpoint}`;

  const headers = new Headers();

  headers.set(HEADERS.CONTENT_TYPE, "application/json");
  headers.set(HEADERS.AUTHORIZATION, `Bearer ${CHECKOUT_PUBLIC_API_KEY}`);

  const response = await loggedFetch(
    url,
    {
      ...options,
      headers,
      signal: AbortSignal.timeout(API_CONSTANTS.DEFAULT_TIMEOUT),
    },
    {
      feature: ApiActivityFeatures.Checkout,
      initiator: "src/lib/clients/checkout.ts#checkoutRequest",
      service: ApiActivityServices.Checkout,
    }
  );

  const data = await response.json();

  return { data, status: response.status };
}
