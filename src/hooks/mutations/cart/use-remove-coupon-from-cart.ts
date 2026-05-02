import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { useHandleAuthRevoked } from "@/hooks/auth/use-handle-auth-revoked";
import { useOfflineToast } from "@/hooks/ui/use-offline-toast";
import { removeCouponFromCartAction } from "@/lib/actions/cart/remove-coupon-from-cart";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { isError, isUnauthenticated } from "@/lib/utils/service-result";

import type { Cart } from "@/lib/models/cart";

export const useRemoveCouponFromCart = () => {
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;

  const { showOfflineMessage } = useOfflineToast();

  const handleAuthRevoked = useHandleAuthRevoked();

  return useMutation({
    mutationFn: removeCouponFromCartAction,
    mutationKey: MUTATION_KEYS.COUPON.REMOVE({ locale }),

    onError: () => {
      if (!navigator.onLine) {
        showOfflineMessage();
      }
    },

    onSettled: async (data) => {
      if (isUnauthenticated(data!)) {
        await handleAuthRevoked();
        return;
      }

      if (isError(data!)) {
        return;
      }

      if (data) {
        queryClient.setQueryData<Cart>(QUERY_KEYS.CART.FULL(locale), data.data);
      }
    },
  });
};
