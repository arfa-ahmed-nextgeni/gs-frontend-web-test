import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { appApiRequest } from "@/lib/clients/app-client";
import { APP_API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { Locale } from "@/lib/constants/i18n";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { Cart } from "@/lib/models/cart";

export const useCartPaginatedQuery = ({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) => {
  const locale = useLocale() as Locale;

  return useQuery({
    queryFn: async () => {
      const response = await appApiRequest<Cart>({
        endpoint: APP_API_ENDPOINTS.CART.DETAILS(locale, page, pageSize),
      });

      return response.data;
    },
    queryKey: QUERY_KEYS.CART.PAGINATED(locale, page, pageSize),
  });
};
