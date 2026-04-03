"use client";

import { useEffect, useEffectEvent, useRef } from "react";

import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { useIsReturningFromPaymentError } from "@/hooks/checkout/use-is-returning-from-payment-error";
import { trackCheckoutOrderReview } from "@/lib/analytics/events";
import { CartProperties } from "@/lib/analytics/models/event-models";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";

/**
 * Client component to track checkout_order_review event
 * Placed in checkout page to track when user reaches order review screen
 * Only tracks once per checkout session, even if canPlaceOrder changes
 */
export function CheckoutOrderReviewTracker({
  canPlaceOrder,
  selectedPayment,
}: {
  canPlaceOrder: boolean;
  selectedPayment?: string;
}) {
  const { cart, isLoading } = useCart();
  const { storeConfig } = useStoreConfig();

  const isReturningFromPaymentError = useIsReturningFromPaymentError();
  const hasTracked = useRef(false);

  const trackCheckoutOrderReviewEvent = useEffectEvent(
    ({ cartProperties }: { cartProperties: Partial<CartProperties> }) => {
      if (isReturningFromPaymentError) {
        hasTracked.current = true;
        return;
      }

      const eventProperties = {
        ...cartProperties,
        ...(selectedPayment && { payment_method: selectedPayment }),
      };

      trackCheckoutOrderReview(eventProperties);
      hasTracked.current = true;
    }
  );

  useEffect(() => {
    // Track when user reaches order review screen (canPlaceOrder becomes true)
    if (canPlaceOrder && !isLoading && cart && !hasTracked.current) {
      // Build cart properties using helper function
      const cartProperties = buildCartProperties(cart, { storeConfig });
      trackCheckoutOrderReviewEvent({ cartProperties });
    }

    // Reset tracking flag when canPlaceOrder becomes false
    if (!canPlaceOrder) {
      hasTracked.current = false;
    }
  }, [canPlaceOrder, cart, isLoading, selectedPayment, storeConfig]);

  useEffect(() => {
    return () => {
      hasTracked.current = false;
    };
  }, []);

  return null;
}
