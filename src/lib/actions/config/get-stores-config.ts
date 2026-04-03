import "server-only";

import { cache } from "react";

import { restRequest } from "@/lib/clients/rest";
import { USE_BUNDLED_STORE_CONFIG_FALLBACK } from "@/lib/config/server-env";
import { API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { CacheTags } from "@/lib/constants/cache/tags";
import bundledStoreConfigFallback from "@/lib/data/fallbacks/store-config.json";
import { GetStoreConfigResponse } from "@/lib/types/store-config";
import { ok } from "@/lib/utils/service-result";

const bundledStoreConfig = [
  bundledStoreConfigFallback,
] as unknown as GetStoreConfigResponse;

export const getStoresConfig = cache(async () => {
  if (USE_BUNDLED_STORE_CONFIG_FALLBACK) {
    return ok(bundledStoreConfig);
  }

  try {
    const response = await restRequest<GetStoreConfigResponse>({
      endpoint: API_ENDPOINTS.CONFIG.STORES_CONFIG,
      requestInit: {
        next: { revalidate: 900, tags: [CacheTags.Magento] },
      },
    });

    if (!response.data) {
      console.error("Empty stores config response, using bundled fallback");
      return ok(bundledStoreConfig);
    }

    return ok(response.data);
  } catch {
    console.error("Error fetching stores config, using bundled fallback");
    return ok(bundledStoreConfig);
  }
});
