import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";

import { useToastContext } from "@/components/providers/toast-provider";
import { useHandleAuthRevoked } from "@/hooks/auth/use-handle-auth-revoked";
import { useOfflineToast } from "@/hooks/ui/use-offline-toast";
import { swapGiftWrapAction } from "@/lib/actions/cart/swap-gift-wrap";
import { trackAddGift } from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { isError, isOk, isUnauthenticated } from "@/lib/utils/service-result";

import type { Cart } from "@/lib/models/cart";

export const useSwapGiftWrap = () => {
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;

  const { showError, showSuccess } = useToastContext();
  const { showOfflineMessage } = useOfflineToast();

  const handleAuthRevoked = useHandleAuthRevoked();

  const t = useTranslations("CheckoutPage.AddGiftWrappingDrawer");

  return useMutation({
    mutationFn: swapGiftWrapAction,
    mutationKey: MUTATION_KEYS.CART.SWAP_GIFT_WRAP({ locale }),

    onError: () => {
      if (!navigator.onLine) {
        showOfflineMessage();
      }
    },

    onSettled: async (data) => {
      if (!data) return;

      if (isUnauthenticated(data)) {
        await handleAuthRevoked();
        return;
      }

      if (isError(data)) {
        showError(data.error, " ");
        // Server cart may be in partial state (old wrap removed, new wrap not added).
        // Refetch to resync cache with server truth.
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CART.FULL(locale),
        });
        return;
      }

      if (isOk(data)) {
        queryClient.setQueryData<Cart>(QUERY_KEYS.CART.FULL(locale), data.data);

        if (data.data) {
          trackAddGift(buildCartProperties(data.data));
        }

        showSuccess(t("giftItemSuccessfullyAddedToCart"), " ");
      }
    },
  });
};
