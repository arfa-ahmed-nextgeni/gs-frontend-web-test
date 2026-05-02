import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { useHandleAuthRevoked } from "@/hooks/auth/use-handle-auth-revoked";
import { useOfflineToast } from "@/hooks/ui/use-offline-toast";
import { useRouteMatch } from "@/hooks/use-route-match";
import { applyCouponToCartAction } from "@/lib/actions/cart/apply-coupon-to-cart";
import {
  trackCartPromocodeError,
  trackCartPromocodeOk,
  trackCheckoutPromocodeError,
  trackCheckoutPromocodeOk,
} from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { isError, isUnauthenticated } from "@/lib/utils/service-result";

import type { Cart } from "@/lib/models/cart";

export const useApplyCouponToCart = () => {
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;
  const { isCheckout } = useRouteMatch();
  const { cart } = useCart();
  const { storeConfig } = useStoreConfig();

  const { showOfflineMessage } = useOfflineToast();

  const handleAuthRevoked = useHandleAuthRevoked();

  return useMutation({
    mutationFn: applyCouponToCartAction,
    mutationKey: MUTATION_KEYS.COUPON.APPLY({ locale }),

    onError: () => {
      if (!navigator.onLine) {
        showOfflineMessage();
      }
    },

    onSettled: async (data, error, variables) => {
      if (isUnauthenticated(data!)) {
        await handleAuthRevoked();
        return;
      }

      if (isError(data!)) {
        if (cart) {
          const cartProperties = buildCartProperties(
            cart,
            isCheckout ? { storeConfig } : undefined
          );

          // Track cart_promocode_error only in cart (not checkout)
          if (!isCheckout) {
            trackCartPromocodeError(cartProperties, variables.couponCode);
          }

          // Track checkout_promocode_error if in checkout
          if (isCheckout) {
            trackCheckoutPromocodeError(cartProperties, variables.couponCode);
          }
        }
        return;
      }

      if (data) {
        queryClient.setQueryData<Cart>(QUERY_KEYS.CART.FULL(locale), data.data);
      }

      const updatedCart =
        queryClient.getQueryData<Cart>(QUERY_KEYS.CART.FULL(locale)) ?? cart;

      // Track cart_promocode_ok on success (only in cart, not checkout)
      if (updatedCart) {
        const cartProperties = buildCartProperties(
          updatedCart,
          isCheckout ? { storeConfig } : undefined
        );

        // Track cart_promocode_ok only in cart (not checkout)
        if (!isCheckout) {
          trackCartPromocodeOk(cartProperties, variables.couponCode);
        }

        // Track checkout_promocode_ok if in checkout
        if (isCheckout) {
          trackCheckoutPromocodeOk(cartProperties, variables.couponCode);
        }
      }
    },
  });
};
