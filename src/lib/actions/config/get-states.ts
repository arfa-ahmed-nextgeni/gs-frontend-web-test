import "server-only";

import { cache } from "react";

import { restRequest } from "@/lib/clients/rest";
import { API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { Locale, LOCALE_TO_STORE } from "@/lib/constants/i18n";
import { StatesDto } from "@/lib/types/api/config";
import { failure, ok } from "@/lib/utils/service-result";

export const getStates = cache(
  async ({ countryCode, locale }: { countryCode: string; locale: Locale }) => {
    try {
      const response = await restRequest<StatesDto>({
        endpoint: API_ENDPOINTS.CONFIG.STATES(countryCode),
        storeCode: LOCALE_TO_STORE[locale],
      });

      const data = response.data.map(({ id, name }) => ({
        label: name,
        value: id,
      }));

      return ok(data);
    } catch (error) {
      console.error("Error fetching states:", error);
      return failure("Failed to get states");
    }
  }
);
