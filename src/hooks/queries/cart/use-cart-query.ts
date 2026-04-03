import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouteMatch } from "@/hooks/use-route-match";
import { invalidateSession } from "@/lib/actions/auth/invalidate-session";
import { appApiRequest } from "@/lib/clients/app-client";
import { APP_API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { Locale } from "@/lib/constants/i18n";
import { MAX_PAGE_SIZE } from "@/lib/constants/pagination";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { ROUTES } from "@/lib/constants/routes";
import { Cart } from "@/lib/models/cart";
import { isUnauthenticated } from "@/lib/utils/service-result";

export const useCartQuery = () => {
  const queryClient = useQueryClient();

  const locale = useLocale() as Locale;

  const { isCustomer } = useRouteMatch();

  const isMobile = useIsMobile();

  return useQuery({
    gcTime: Infinity,
    queryFn: async () => {
      const response = await appApiRequest<Cart>({
        endpoint: APP_API_ENDPOINTS.CART.DETAILS(locale, 1, MAX_PAGE_SIZE),
      });

      if (isUnauthenticated(response)) {
        const redirectTo =
          isCustomer && isMobile ? ROUTES.CUSTOMER.ROOT : ROUTES.ROOT;
        await invalidateSession(redirectTo);
        await queryClient.invalidateQueries();
      }

      return response.data;
    },
    queryKey: QUERY_KEYS.CART.FULL(locale),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
};
