import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";

import { useToastContext } from "@/components/providers/toast-provider";
import { useOfflineToast } from "@/hooks/ui/use-offline-toast";
import { addProductsToCartWithGiftMessageAction } from "@/lib/actions/cart/add-products-to-cart-with-gift-message";
import { trackAddGift } from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { isError } from "@/lib/utils/service-result";

import type { Cart } from "@/lib/models/cart";

export const useAddProductsToCartWithGiftMessage = ({
  giftMessage,
  selectedOptionId,
  sku,
}: {
  giftMessage?: {
    from?: string;
    message?: string;
    to?: string;
  };
  selectedOptionId?: string;
  sku: string;
}) => {
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;

  const { showError, showSuccess } = useToastContext();
  const { showOfflineMessage } = useOfflineToast();

  const t = useTranslations("CheckoutPage.AddGiftWrappingDrawer");

  const mutationKey = MUTATION_KEYS.CART.ADD_WITH_GIFT_MESSAGE({
    locale,
    sku,
  });

  return useMutation({
    mutationFn: (params?: {
      giftMessage?: {
        from?: string;
        message?: string;
        to?: string;
      };
      selectedOptionId?: string;
      sku: string;
    }) =>
      addProductsToCartWithGiftMessageAction({
        giftMessage: params?.giftMessage ?? giftMessage,
        selectedOptionId: params?.selectedOptionId ?? selectedOptionId,
        sku: params?.sku ?? sku,
      }),

    mutationKey,

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

      // Track add_gift event after successful addition
      const cart = queryClient.getQueryData<Cart>(QUERY_KEYS.CART.FULL(locale));

      if (cart) {
        const cartProperties = buildCartProperties(cart);
        trackAddGift(cartProperties);
      }

      showSuccess(t("giftItemSuccessfullyAddedToCart"), " ");
    },
  });
};
