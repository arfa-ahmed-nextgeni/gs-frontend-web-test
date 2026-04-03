import { API_CONSTANTS } from "@/lib/constants/api";
import {
  ServiceResultError,
  ServiceResultOk,
  ServiceResultUnauthenticated,
} from "@/lib/types/service-result";

export async function appApiRequest<T>({
  endpoint,
  options,
}: {
  endpoint: string;
  options?: RequestInit;
}): Promise<
  ServiceResultError | ServiceResultOk<T> | ServiceResultUnauthenticated
> {
  const url = endpoint.startsWith("/api/") ? endpoint : `/api${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    signal: AbortSignal.timeout(API_CONSTANTS.DEFAULT_TIMEOUT),
  });

  const data = (await response.json()) as
    | ServiceResultError
    | ServiceResultOk<T>
    | ServiceResultUnauthenticated;

  return data;
}
