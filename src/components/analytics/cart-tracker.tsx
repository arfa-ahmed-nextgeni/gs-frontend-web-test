"use client";

import { useEffect, useRef } from "react";

import { useCart } from "@/contexts/use-cart";
import { trackViewCart } from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";

/**
 * Client component to track cart page view event
 * Placed in cart page to track when users view the cart
 * Only tracks once per page load, even if cart data updates
 */
export function CartTracker() {
  const { cart, isLoading } = useCart();
  const hasTracked = useRef(false);

  // Reset only on unmount (user left cart page) so we track again when they come back (React Activity preserves ref)
  useEffect(() => {
    return () => {
      hasTracked.current = false;
    };
  }, []);

  // Track once when cart is available; no cleanup so cart updates don't reset the ref
  useEffect(() => {
    if (hasTracked.current || isLoading || !cart) {
      return;
    }

    const cartProperties = buildCartProperties(cart);
    trackViewCart(cartProperties, cart.items);
    hasTracked.current = true;
  }, [cart, isLoading]);

  return null;
}
