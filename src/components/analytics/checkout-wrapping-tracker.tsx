"use client";

import { useEffect, useRef } from "react";

import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { trackCheckoutWrapping } from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";

/**
 * Client component to track checkout_wrapping event
 * Placed in gift wrapping page to track when the page opens
 * Only tracks once per page load
 */
export function CheckoutWrappingTracker() {
  const { cart, isLoading } = useCart();
  const { storeConfig } = useStoreConfig();
  const hasTracked = useRef(false);

  useEffect(() => {
    // Track when page opens and cart data is available
    if (!hasTracked.current && !isLoading && cart) {
      // Build cart properties using helper function
      const cartProperties = buildCartProperties(cart, { storeConfig });

      trackCheckoutWrapping(cartProperties);
      hasTracked.current = true;
    }

    return () => {
      hasTracked.current = false;
    };
  }, [cart, isLoading, storeConfig]);

  return null;
}
