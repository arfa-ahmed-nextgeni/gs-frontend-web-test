import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { appApiRequest } from "@/lib/clients/app-client";
import { APP_API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { isOk } from "@/lib/utils/service-result";

import type { Locale } from "@/lib/constants/i18n";
import type { ProductCardModel } from "@/lib/models/product-card-model";

export const useCartDrawerSuggestedProductsQuery = ({
  enabled,
}: {
  enabled: boolean;
}) => {
  const locale = useLocale() as Locale;

  return useQuery({
    enabled,
    queryFn: async () => {
      const response = await appApiRequest<ProductCardModel[]>({
        endpoint: APP_API_ENDPOINTS.CART.SUGGESTED_PRODUCTS(locale),
      });

      if (!isOk(response)) {
        return [];
      }

      return response.data;
    },
    queryKey: QUERY_KEYS.CART.SUGGESTED_PRODUCTS(locale),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });
};
