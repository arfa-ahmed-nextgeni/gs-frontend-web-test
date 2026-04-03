import { useCallback } from "react";

import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { trackCheckoutSubmitError } from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";

import type { DeliveryMethod } from "@/components/checkout/delivery/delivery-methods/types";

/**
 * Hook to track checkout submit error
 * Returns a function that can be called to track checkout_submit_error event
 * @param shippingMethods - Array of available shipping methods
 * @param selectedDelivery - ID of the selected delivery method
 * @param selectedPayment - Code of the selected payment method
 * @returns Function to track checkout submit error
 */
export function useTrackCheckoutSubmitError(
  shippingMethods: DeliveryMethod[],
  selectedDelivery: string,
  selectedPayment: string
) {
  const { cart } = useCart();
  const { storeConfig } = useStoreConfig();

  return useCallback(() => {
    if (cart) {
      const cartProperties = buildCartProperties(cart, { storeConfig });
      const shippingMethod = shippingMethods.find(
        (method) => method.id === selectedDelivery
      );
      trackCheckoutSubmitError(
        cartProperties,
        selectedPayment || "",
        shippingMethod?.method_code || ""
      );
    }
  }, [cart, shippingMethods, selectedDelivery, selectedPayment, storeConfig]);
}
