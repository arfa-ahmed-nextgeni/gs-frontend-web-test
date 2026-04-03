"use client";

import { useEffect, useRef } from "react";

import { trackCheckoutAddress } from "@/lib/analytics/events";

/**
 * Client component to track checkout_address event
 * Placed in checkout address drawer to track when the drawer is opened
 */
export function CheckoutAddressTracker() {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) {
      return;
    }

    trackCheckoutAddress();
    hasTracked.current = true;

    return () => {
      hasTracked.current = false;
    };
  }, []);

  return null;
}
