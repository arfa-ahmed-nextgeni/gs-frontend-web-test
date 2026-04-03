import { useRef } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { useToastContext } from "@/components/providers/toast-provider";
import { useOfflineToast } from "@/hooks/ui/use-offline-toast";
import { removeProductFromCartAction } from "@/lib/actions/cart/remove-product-from-cart";
import { trackCartRemove } from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { Cart } from "@/lib/models/cart";
import { isError, isOk } from "@/lib/utils/service-result";

export const useRemoveProductFromCart = ({ sku }: { sku: string }) => {
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;
  const removedProductIdRef = useRef<string | undefined>(undefined);

  const { showError } = useToastContext();
  const { showOfflineMessage } = useOfflineToast();

  return useMutation({
    mutationFn: removeProductFromCartAction,
    mutationKey: MUTATION_KEYS.CART.REMOVE({ locale, sku }),

    onError: () => {
      if (!navigator.onLine) {
        showOfflineMessage();
      }
    },

    onMutate: async (variables) => {
      const cart = queryClient.getQueryData<Cart>(QUERY_KEYS.CART.FULL(locale));
      const item = cart?.items.find(
        (cartItem) => cartItem.uidInCart === variables.itemUid
      );
      removedProductIdRef.current = item?.externalId;
    },

    onSettled: async (data) => {
      if (isError(data!)) {
        showError(data.error, " ");
        return;
      }

      if (isOk(data!)) {
        queryClient.setQueryData<Cart>(QUERY_KEYS.CART.FULL(locale), data.data);

        const cart = queryClient.getQueryData<Cart>(
          QUERY_KEYS.CART.FULL(locale)
        );
        if (cart) {
          const cartProperties = buildCartProperties(cart);
          trackCartRemove(cartProperties, {
            "product.id": removedProductIdRef.current,
          });
        }
        removedProductIdRef.current = undefined;
      }
    },
  });
};
