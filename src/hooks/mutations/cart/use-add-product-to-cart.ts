import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";

import { useToastContext } from "@/components/providers/toast-provider";
import { useCartDrawer } from "@/contexts/cart-drawer-context";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useOfflineToast } from "@/hooks/ui/use-offline-toast";
import { useRouteMatch } from "@/hooks/use-route-match";
import { addProductToCartAction } from "@/lib/actions/cart/add-product-to-cart";
import { trackAddToCart } from "@/lib/analytics/events";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { isError } from "@/lib/utils/service-result";

import type { ProductProperties } from "@/lib/analytics/models/event-models";
import type { Cart } from "@/lib/models/cart";

export const useAddProductToCart = ({
  product,
  selectedOptionId,
  sku,
}: {
  product?: Partial<ProductProperties>;
  selectedOptionId?: string;
  sku: string;
}) => {
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;
  const { isCart } = useRouteMatch();

  const { storeConfig } = useStoreConfig();

  const { showError, showSuccess } = useToastContext();
  const { showOfflineMessage } = useOfflineToast();

  const { openCartDrawer } = useCartDrawer();

  const t = useTranslations("CartPage");

  return useMutation({
    mutationFn: addProductToCartAction,
    mutationKey: MUTATION_KEYS.CART.ADD({ locale, selectedOptionId, sku }),

    onError: () => {
      if (!navigator.onLine) {
        showOfflineMessage();
      }
    },

    onSettled: async (data) => {
      if (isError(data!)) {
        showError(data.error, " ");
        return;
      }

      if (data) {
        queryClient.setQueryData<Cart>(QUERY_KEYS.CART.FULL(locale), data.data);
      }

      const cart = queryClient.getQueryData<Cart>(QUERY_KEYS.CART.FULL(locale));

      // Track add_to_cart event on success
      if (product) {
        trackAddToCart(product, cart, storeConfig?.currencyCode);
      }

      if (!isCart) {
        openCartDrawer();
      } else {
        showSuccess(t("successfullyAddedToCart"), " ");
      }
    },
  });
};
