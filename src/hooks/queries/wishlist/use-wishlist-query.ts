import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { useUI } from "@/contexts/use-ui";
import { appApiRequest } from "@/lib/clients/app-client";
import { APP_API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { Locale } from "@/lib/constants/i18n";
import { MAX_PAGE_SIZE } from "@/lib/constants/pagination";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { Wishlist } from "@/lib/models/wishlist";

export const useWishlistQuery = () => {
  const locale = useLocale() as Locale;

  const { isAuthorized } = useUI();

  return useQuery({
    enabled: !!isAuthorized,
    gcTime: Infinity,
    queryFn: async () => {
      const response = await appApiRequest<Wishlist>({
        endpoint: APP_API_ENDPOINTS.CUSTOMER.WISHLIST(locale, 1, MAX_PAGE_SIZE),
      });

      return response.data;
    },
    queryKey: QUERY_KEYS.WISHLIST.FULL(locale),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
};
