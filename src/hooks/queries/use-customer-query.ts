import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { useUI } from "@/contexts/use-ui";
import { appApiRequest } from "@/lib/clients/app-client";
import { APP_API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { Locale } from "@/lib/constants/i18n";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { Customer } from "@/lib/models/customer";

/**
 * Get customer query configuration for use with queryClient.fetchQuery
 * @param locale - The locale string
 * @returns Query configuration object with queryFn and queryKey
 */
export function getCustomerQueryConfig(locale: Locale) {
  return {
    queryFn: async () => {
      const response = await appApiRequest<Customer>({
        endpoint: APP_API_ENDPOINTS.CUSTOMER.ME,
      });

      return response.data;
    },
    queryKey: QUERY_KEYS.CUSTOMER(locale),
  };
}

export const useCustomerQuery = () => {
  const { isAuthorized } = useUI();
  const locale = useLocale() as Locale;

  return useQuery({
    enabled: !!isAuthorized,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    ...getCustomerQueryConfig(locale),
  });
};
