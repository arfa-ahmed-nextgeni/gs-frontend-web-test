import { useMutation } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { useToastContext } from "@/components/providers/toast-provider";
import { useNotifyMe } from "@/contexts/notify-me-context";
import { useOfflineToast } from "@/hooks/ui/use-offline-toast";
import { subscribeStockNotification } from "@/lib/actions/product/subscribe-stock-notification";
import { trackProductNotify } from "@/lib/analytics/events";
import {
  buildProductPropertiesFromCard,
  buildProductPropertiesFromDetails,
} from "@/lib/analytics/utils/build-properties";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { isError } from "@/lib/utils/service-result";

export const useSubscribeStockNotification = ({
  onSuccess,
  productId,
}: {
  onSuccess: () => void;
  productId: string;
}) => {
  const locale = useLocale() as Locale;
  const { showError, showSuccess } = useToastContext();
  const { showOfflineMessage } = useOfflineToast();
  const { product, productCard, selectedProduct } = useNotifyMe();

  return useMutation({
    mutationFn: subscribeStockNotification,
    mutationKey: MUTATION_KEYS.STOCK_NOTIFICATION.SUBSCRIBE({
      locale,
      productId,
    }),

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

      // Track product_notify event on success
      if (product && selectedProduct) {
        // Use ProductDetailsModel data (from product page)
        trackProductNotify(
          buildProductPropertiesFromDetails(selectedProduct, product)
        );
      } else if (productCard) {
        // Use ProductCardModel data (from product card)
        trackProductNotify(buildProductPropertiesFromCard(productCard));
      }

      showSuccess(data?.data, " ");
      onSuccess?.();
    },
  });
};
