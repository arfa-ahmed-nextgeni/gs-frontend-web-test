import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { appApiRequest } from "@/lib/clients/app-client";
import { APP_API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { Locale } from "@/lib/constants/i18n";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { Store } from "@/lib/models/stores";
import { LocaleSwitchOption } from "@/lib/types/store-config";

export const useStoreConfigQuery = () => {
  const locale = useLocale() as Locale;

  return useQuery({
    gcTime: Infinity,
    queryFn: async () => {
      const response = await appApiRequest<{
        localeSwitchOptions: LocaleSwitchOption[];
        store: Store;
      }>({
        endpoint: APP_API_ENDPOINTS.STORE_CONFIG(locale),
      });

      return response.data;
    },
    queryKey: QUERY_KEYS.STORE_CONFIG(locale),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
};
