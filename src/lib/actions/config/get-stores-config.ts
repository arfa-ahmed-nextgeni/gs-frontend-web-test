import "server-only";

import { cache } from "react";

import { restRequest } from "@/lib/clients/rest";
import { API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { CacheTags } from "@/lib/constants/cache/tags";
import { GetStoreConfigResponse } from "@/lib/types/store-config";
import { failure, ok } from "@/lib/utils/service-result";

export const getStoresConfig = cache(async () => {
  try {
    const response = await restRequest<GetStoreConfigResponse>({
      endpoint: API_ENDPOINTS.CONFIG.STORES_CONFIG,
      requestInit: {
        next: { revalidate: 900, tags: [CacheTags.Magento] },
      },
    });

    if (!response.data) {
      return failure("Failed to fetch store configuration");
    }

    return ok(response.data);
  } catch {
    console.error("Error fetching stores config");
    return failure("Failed to fetch store configuration");
  }
});
