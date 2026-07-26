import "server-only";

import { cache } from "react";

import { restRequest } from "@/lib/clients/rest";
import { API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import {
  BRAND_LOCALE_TO_BASE_LOCALE,
  Locale,
  LOCALE_TO_STORE,
} from "@/lib/constants/i18n";
import { CitiesDto } from "@/lib/types/api/config";
import { getLocaleInfo } from "@/lib/utils/locale";
import { failure, ok } from "@/lib/utils/service-result";

export const getCities = cache(async ({ locale }: { locale: Locale }) => {
  try {
    const baseLocale = BRAND_LOCALE_TO_BASE_LOCALE[locale] ?? locale;
    const { language, region } = getLocaleInfo(baseLocale);

    const response = await restRequest<CitiesDto>({
      endpoint: API_ENDPOINTS.CONFIG.CITIES(region),
      storeCode: LOCALE_TO_STORE[baseLocale],
    });

    const data = response.data.map(({ city, city_ar }) => ({
      label: language === "ar" ? city_ar : city,
      value: city,
    }));

    return ok(data);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return failure("Failed to get cities");
  }
});
