import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { useToastContext } from "@/components/providers/toast-provider";
import { useOfflineToast } from "@/hooks/ui/use-offline-toast";
import { updateCartItemQuantity } from "@/lib/actions/cart/update-cart-item-quantity";
import { Locale } from "@/lib/constants/i18n";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { Cart } from "@/lib/models/cart";
import { isError } from "@/lib/utils/service-result";

export const useUpdateCartItemQuantity = () => {
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;

  const { showError } = useToastContext();
  const { showOfflineMessage } = useOfflineToast();

  return useMutation({
    mutationFn: updateCartItemQuantity,

    onError: () => {
      if (!navigator.onLine) {
        showOfflineMessage();
      }
    },

    onSettled: (data) => {
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
