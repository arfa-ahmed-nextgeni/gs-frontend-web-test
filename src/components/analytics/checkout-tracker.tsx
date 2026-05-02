"use client";

import { useEffect, useEffectEvent, useRef } from "react";

import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { useIsReturningFromPaymentError } from "@/hooks/checkout/use-is-returning-from-payment-error";
import { trackBeginCheckout, trackCheckoutInit } from "@/lib/analytics/events";
import { CartProperties } from "@/lib/analytics/models/event-models";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";

/**
 * Client component to track checkout_init event
 * Placed in checkout page to track when users initiate checkout
 * Only tracks once per page load, even if cart data updates
 */
export function CheckoutTracker() {
  const { cart, isLoading } = useCart();
  const { storeConfig } = useStoreConfig();
  const isReturningFromPaymentError = useIsReturningFromPaymentError();
  const hasTracked = useRef(false);

  const trackCheckoutInitEvent = useEffectEvent(
    ({ cartProperties }: { cartProperties: Partial<CartProperties> }) => {
      if (isReturningFromPaymentError) {
        hasTracked.current = true;
        return;
      }

      trackCheckoutInit(cartProperties);
      trackBeginCheckout(cart!);
      hasTracked.current = true;
    }
  );

  useEffect(() => {
    // Only track once per page load and when cart data is available
    if (hasTracked.current || isLoading || !cart) {
      return;
    }

    const cartProperties = buildCartProperties(cart, { storeConfig });

    trackCheckoutInitEvent({ cartProperties });
  }, [cart, isLoading, storeConfig]);

  useEffect(() => {
    return () => {
      hasTracked.current = false;
    };
  }, []);

  return null;
}
