import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { useToastContext } from "@/components/providers/toast-provider";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useHandleAuthRevoked } from "@/hooks/auth/use-handle-auth-revoked";
import { useOfflineToast } from "@/hooks/ui/use-offline-toast";
import { removeRewardPointsFromCartAction } from "@/lib/actions/cart/remove-reward-points-from-cart";
import { Locale, StoreCode } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { isError, isUnauthenticated } from "@/lib/utils/service-result";

import type { Cart } from "@/lib/models/cart";

export const useRemoveRewardPointsFromCart = () => {
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;
  const { storeConfig } = useStoreConfig();

  const { showError } = useToastContext();
  const { showOfflineMessage } = useOfflineToast();

  const handleAuthRevoked = useHandleAuthRevoked();

  return useMutation({
    mutationFn: () =>
      removeRewardPointsFromCartAction({
        storeCode: storeConfig?.code as StoreCode,
      }),
    mutationKey: MUTATION_KEYS.CART.REMOVE_REWARD_POINTS({ locale }),

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
        showError(data.error, " ");
        return;
      }

      if (data) {
        queryClient.setQueryData<Cart>(QUERY_KEYS.CART.FULL(locale), data.data);
      }
    },
  });
};
