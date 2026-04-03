import "server-only";

import { cache } from "react";

import { graphqlRequest } from "@/lib/clients/graphql";
import { CONFIG_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/config";
import { Locale, LOCALE_TO_STORE } from "@/lib/constants/i18n";
import { getLocaleInfo } from "@/lib/utils/locale";
import { failure, ok } from "@/lib/utils/service-result";

export const getCountries = cache(async ({ locale }: { locale: Locale }) => {
  try {
    const { language } = getLocaleInfo(locale);

    const response = await graphqlRequest({
      query: CONFIG_GRAPHQL_QUERIES.GET_COUNTRIES,
      storeCode: LOCALE_TO_STORE[locale],
    });

    if (!response.data?.countries) {
      return failure("Failed to get countries");
    }

    const countries = response.data.countries.map((country) => ({
      label:
        language === "ar"
          ? (country?.full_name_locale as string)
          : (country?.full_name_locale as string),
      value: country?.id as string,
    }));

    return ok(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    return failure("Failed to get countries");
  }
});
