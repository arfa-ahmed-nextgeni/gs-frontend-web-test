import { useRef } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { useToastContext } from "@/components/providers/toast-provider";
import { useHandleAuthRevoked } from "@/hooks/auth/use-handle-auth-revoked";
import { useOfflineToast } from "@/hooks/ui/use-offline-toast";
import { removeProductFromCartAction } from "@/lib/actions/cart/remove-product-from-cart";
import { trackCartRemove } from "@/lib/analytics/events";
import { trackCartClear } from "@/lib/analytics/events";
import { ProductProperties } from "@/lib/analytics/models/event-models";
import {
  buildCartProperties,
  buildProductPropertiesFromCartItem,
} from "@/lib/analytics/utils/build-properties";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { Cart } from "@/lib/models/cart";
import { isError, isOk, isUnauthenticated } from "@/lib/utils/service-result";

export const useRemoveProductFromCart = ({
  skipTracking = false,
  sku,
}: {
  skipTracking?: boolean;
  sku: string;
}) => {
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;
  const removedProductRef = useRef<Partial<ProductProperties> | undefined>(
    undefined
  );

  const { showError } = useToastContext();
  const { showOfflineMessage } = useOfflineToast();

  const handleAuthRevoked = useHandleAuthRevoked();

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
      removedProductRef.current = item
        ? buildProductPropertiesFromCartItem(item) // ← pura product object
        : undefined;
    },

    onSettled: async (data) => {
      if (isUnauthenticated(data!)) {
        await handleAuthRevoked();
        return;
      }

      if (isError(data!)) {
        showError(data.error, " ");
        return;
      }

      if (isOk(data!)) {
        queryClient.setQueryData<Cart>(QUERY_KEYS.CART.FULL(locale), data.data);

        const cart = queryClient.getQueryData<Cart>(
          QUERY_KEYS.CART.FULL(locale)
        );
        if (cart && !skipTracking) {
          const cartProperties = buildCartProperties(cart);
          trackCartRemove(
            cartProperties,
            removedProductRef.current as ProductProperties
          );

          if (cart.items.length === 0) {
            trackCartClear();
          }
        }
        removedProductRef.current = undefined;
      }
    },
  });
};
