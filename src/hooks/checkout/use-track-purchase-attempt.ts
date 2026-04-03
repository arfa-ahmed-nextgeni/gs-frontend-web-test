import { useCallback } from "react";

import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { trackPurchaseAttempt } from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";

import type { DeliveryMethod } from "@/components/checkout/delivery/delivery-methods/types";

/**
 * Hook to track purchase attempt
 * Returns a function that can be called to track purchase_attempt event
 * @param shippingMethods - Array of available shipping methods
 * @param selectedDelivery - ID of the selected delivery method
 * @param selectedPayment - Code of the selected payment method
 * @returns Function to track purchase attempt
 */
export function useTrackPurchaseAttempt(
  shippingMethods: DeliveryMethod[],
  selectedDelivery: string,
  selectedPayment: string
) {
  const { cart } = useCart();
  const { storeConfig } = useStoreConfig();

  return useCallback(() => {
    if (cart) {
      const cartProperties = buildCartProperties(cart, { storeConfig });
      const selectedMethod = shippingMethods.find(
        (method) => method.id === selectedDelivery
      );
      trackPurchaseAttempt(
        cartProperties,
        selectedPayment || "",
        selectedMethod?.method_code || ""
      );
    }
  }, [cart, storeConfig, shippingMethods, selectedPayment, selectedDelivery]);
}
