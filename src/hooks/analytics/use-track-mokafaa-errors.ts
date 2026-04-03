import { useCallback } from "react";

import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { useRouteMatch } from "@/hooks/use-route-match";
import {
  trackMokafaaAmountError,
  trackMokafaaOtpError,
} from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";

/**
 * Hook to track mokafaa error events with cart properties
 * Returns functions that automatically include cart properties when tracking errors
 */
export function useTrackMokafaaErrors() {
  const { cart } = useCart();
  const { storeConfig } = useStoreConfig();
  const { isCheckout } = useRouteMatch();

  const paymentMethod = cart?.selectedPaymentMethod?.code || "";

  const trackAmountError = useCallback(() => {
    const cartProperties = cart
      ? buildCartProperties(cart, isCheckout ? { storeConfig } : undefined)
      : undefined;
    const eventProperties = cartProperties
      ? { ...cartProperties, payment_method: paymentMethod }
      : undefined;

    trackMokafaaAmountError(eventProperties);
  }, [cart, isCheckout, paymentMethod, storeConfig]);

  const trackOtpError = useCallback(() => {
    const cartProperties = cart
      ? buildCartProperties(cart, isCheckout ? { storeConfig } : undefined)
      : undefined;
    const eventProperties = cartProperties
      ? { ...cartProperties, payment_method: paymentMethod }
      : undefined;
    trackMokafaaOtpError(eventProperties);
  }, [cart, isCheckout, paymentMethod, storeConfig]);

  return {
    trackAmountError,
    trackOtpError,
  };
}
