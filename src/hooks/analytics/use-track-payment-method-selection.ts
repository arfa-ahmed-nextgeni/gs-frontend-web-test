import { useCallback } from "react";

import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import {
  trackCheckoutPaymentApplepay,
  trackCheckoutPaymentCc,
  trackCheckoutPaymentCod,
  trackCheckoutPaymentTabbyInstallments,
  trackCheckoutPaymentTamaraPayByInstalments,
} from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";
import {
  isApplePayPaymentMethod,
  isCodPaymentMethod,
  isCreditCardPaymentMethod,
  isTabbyPaymentMethod,
  isTamaraPaymentMethod,
  requiresCardPaymentSection,
} from "@/lib/utils/payment-method";

/**
 * Returns a function to track payment method selection on user click.
 * Call when the user clicks a payment method radio button.
 */
export function useTrackPaymentMethodSelection() {
  const { cart } = useCart();
  const { storeConfig } = useStoreConfig();
  return useCallback(
    (methodId: string) => {
      if (!cart) return;

      const cartProperties = buildCartProperties(cart, { storeConfig });
      const eventProperties = {
        ...cartProperties,
        payment_method: methodId,
      };

      if (isCodPaymentMethod(methodId)) {
        trackCheckoutPaymentCod(eventProperties);
      } else if (isApplePayPaymentMethod(methodId)) {
        trackCheckoutPaymentApplepay(eventProperties);
      } else if (isTabbyPaymentMethod(methodId)) {
        trackCheckoutPaymentTabbyInstallments(eventProperties);
      } else if (isTamaraPaymentMethod(methodId)) {
        trackCheckoutPaymentTamaraPayByInstalments(eventProperties);
      } else if (
        isCreditCardPaymentMethod(methodId) ||
        requiresCardPaymentSection(methodId)
      ) {
        trackCheckoutPaymentCc(eventProperties);
      }
    },
    [cart, storeConfig]
  );
}
