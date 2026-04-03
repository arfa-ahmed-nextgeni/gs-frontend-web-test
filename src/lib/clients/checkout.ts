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

  const response = await fetch(url, {
    ...options,
    headers,
    signal: AbortSignal.timeout(API_CONSTANTS.DEFAULT_TIMEOUT),
  });

  const data = await response.json();

  return { data, status: response.status };
}
