import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { appApiRequest } from "@/lib/clients/app-client";
import { AddressStepType } from "@/lib/constants/address";
import { APP_API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { Locale } from "@/lib/constants/i18n";
import { SelectOption } from "@/lib/types/ui-types";

export const useAddressOptionsQuery = ({
  addressType,
  city,
  country,
}: {
  addressType?: AddressStepType;
  city: string;
  country: string;
}) => {
  const locale = useLocale() as Locale;

  const apiEndpoint = useMemo(() => {
    switch (addressType) {
      case AddressStepType.Area:
        return APP_API_ENDPOINTS.ADDRESS.AREAS(locale, city);
      case AddressStepType.City:
        return APP_API_ENDPOINTS.ADDRESS.CITIES(locale);
      case AddressStepType.Country:
        return APP_API_ENDPOINTS.ADDRESS.COUNTRIES(locale);
      case AddressStepType.State:
        return APP_API_ENDPOINTS.ADDRESS.STATES(locale, country);
      default:
        return "";
    }
  }, [addressType, city, country, locale]);

  return useQuery({
    enabled: !!apiEndpoint,
    queryFn: async () => {
      const response = await appApiRequest<SelectOption[]>({
        endpoint: apiEndpoint,
      });

      return response.data;
    },
    queryKey: [apiEndpoint],
  });
};
