import "server-only";

import { cache } from "react";

import { restRequest } from "@/lib/clients/rest";
import { API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { Locale, LOCALE_TO_STORE } from "@/lib/constants/i18n";
import { AreasDto, CitiesDto } from "@/lib/types/api/config";
import { getLocaleInfo } from "@/lib/utils/locale";
import { failure, ok } from "@/lib/utils/service-result";

export const getAreas = cache(
  async ({ city, locale }: { city: string; locale: Locale }) => {
    try {
      const { language, region } = getLocaleInfo(locale);

      let cityName = city;

      if (language === "ar") {
        const getCitiesResponse = await restRequest<CitiesDto>({
          endpoint: API_ENDPOINTS.CONFIG.CITIES(region),
          storeCode: LOCALE_TO_STORE[locale],
        });
        const findedCity = getCitiesResponse.data?.find(
          (c) => c.city_ar === city
        );
        cityName = findedCity?.city || city;
      }

      const response = await restRequest<AreasDto>({
        endpoint: API_ENDPOINTS.CONFIG.AREAS(region, cityName),
        storeCode: LOCALE_TO_STORE[locale],
      });

      const data = response.data.map(({ text }) => ({
        label: text,
        value: text,
      }));

      return ok(data);
    } catch (error) {
      console.error("Error fetching areas:", error);
      return failure("Failed to get areas");
    }
  }
);
