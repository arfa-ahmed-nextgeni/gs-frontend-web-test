import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { useOfflineToast } from "@/hooks/ui/use-offline-toast";
import { removeCouponFromCartAction } from "@/lib/actions/cart/remove-coupon-from-cart";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { isError } from "@/lib/utils/service-result";

import type { Cart } from "@/lib/models/cart";

export const useRemoveCouponFromCart = () => {
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;

  const { showOfflineMessage } = useOfflineToast();

  return useMutation({
    mutationFn: removeCouponFromCartAction,
    mutationKey: MUTATION_KEYS.COUPON.REMOVE({ locale }),

    onError: () => {
      if (!navigator.onLine) {
        showOfflineMessage();
      }
    },

    onSettled: async (data) => {
      if (isError(data!)) {
        return;
      }

      if (data) {
        queryClient.setQueryData<Cart>(QUERY_KEYS.CART.FULL(locale), data.data);
      }
    },
  });
};
