import "server-only";

import { cache } from "react";

import { restRequest } from "@/lib/clients/rest";
import { USE_BUNDLED_STORE_CONFIG_FALLBACK } from "@/lib/config/server-env";
import { API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { GetStoreConfigResponse } from "@/lib/types/store-config";
import { failure, ok } from "@/lib/utils/service-result";

const lastGoodStoresConfig: Partial<Record<string, GetStoreConfigResponse>> =
  {};

const isValidStoresConfig = (
  data: GetStoreConfigResponse | undefined
): data is GetStoreConfigResponse => Boolean(data?.[0]?.stores);

const loadBundledStoreConfig = async (): Promise<GetStoreConfigResponse> => {
  const { default: bundledStoreConfigFallback } =
    await import("@/lib/data/fallbacks/store-config.json");

  return [bundledStoreConfigFallback] as unknown as GetStoreConfigResponse;
};

export const getStoresConfig = cache(async (websiteId?: number) => {
  if (USE_BUNDLED_STORE_CONFIG_FALLBACK) {
    return ok(await loadBundledStoreConfig());
  }

  const endpoint = websiteId
    ? API_ENDPOINTS.CONFIG.STORES_CONFIG_BY_WEBSITE(websiteId)
    : API_ENDPOINTS.CONFIG.STORES_CONFIG;

  try {
    const response = await restRequest<GetStoreConfigResponse>({
      endpoint,
    });

    if (!isValidStoresConfig(response.data)) {
      console.error("Empty or invalid stores config response");

      const cached = lastGoodStoresConfig[String(websiteId ?? "default")];
      if (cached) {
        return ok(cached);
      }

      return failure("Error fetching stores config: Empty response");
    }

    lastGoodStoresConfig[String(websiteId ?? "default")] = response.data;

    return ok(response.data);
  } catch (error) {
    console.error("Error fetching stores config: ", error);

    const cached = lastGoodStoresConfig[String(websiteId ?? "default")];
    if (cached) {
      return ok(cached);
    }

    return failure(
      "Error fetching stores config: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
});
