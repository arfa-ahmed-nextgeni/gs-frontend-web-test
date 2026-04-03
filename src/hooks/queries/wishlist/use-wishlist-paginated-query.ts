import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { appApiRequest } from "@/lib/clients/app-client";
import { APP_API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { Locale } from "@/lib/constants/i18n";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { Wishlist } from "@/lib/models/wishlist";

export const useWishlistPaginatedQuery = ({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) => {
  const locale = useLocale() as Locale;

  return useQuery({
    queryFn: async () => {
      const response = await appApiRequest<Wishlist>({
        endpoint: APP_API_ENDPOINTS.CUSTOMER.WISHLIST(locale, page, pageSize),
      });

      return response.data;
    },
    queryKey: QUERY_KEYS.WISHLIST.PAGINATED(locale, page, pageSize),
    refetchOnMount: true,
  });
};
