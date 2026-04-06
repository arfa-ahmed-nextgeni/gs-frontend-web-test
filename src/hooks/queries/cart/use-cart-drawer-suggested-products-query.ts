import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { appApiRequest } from "@/lib/clients/app-client";
import { APP_API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { isOk } from "@/lib/utils/service-result";

import type { Locale } from "@/lib/constants/i18n";
import type { CartSuggestedProductsApiData } from "@/lib/types/cart-suggested-products";

export const useCartDrawerSuggestedProductsQuery = ({
  enabled,
}: {
  enabled: boolean;
}) => {
  const locale = useLocale() as Locale;
  const emptyData: CartSuggestedProductsApiData = {
    products: [],
    title: "",
  };

  return useQuery({
    enabled,
    queryFn: async () => {
      const response = await appApiRequest<CartSuggestedProductsApiData>({
        endpoint: APP_API_ENDPOINTS.CART.SUGGESTED_PRODUCTS(locale),
      });

      if (!isOk(response)) {
        return emptyData;
      }

      return response.data;
    },
    queryKey: QUERY_KEYS.CART.SUGGESTED_PRODUCTS(locale),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });
};
