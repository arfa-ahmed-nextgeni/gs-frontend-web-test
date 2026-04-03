"use client";

import { useEffect, useRef } from "react";

import { useRouteMatch } from "@/hooks/use-route-match";
import { trackCheckoutPromocodeViewExpand } from "@/lib/analytics/events";

/**
 * Client component to track checkout_promocode_view_expand event
 * Placed in coupon dialog to track when the dialog opens in checkout page
 */
export function CheckoutPromocodeViewExpandTracker({
  isDialogOpen,
}: {
  isDialogOpen: boolean;
}) {
  const { isCheckout } = useRouteMatch();
  const hasTracked = useRef(false);
  const wasOpen = useRef(false);

  useEffect(() => {
    // Track when dialog opens (transitions from closed to open) in checkout page
    if (!wasOpen.current && isDialogOpen && isCheckout && !hasTracked.current) {
      trackCheckoutPromocodeViewExpand();
      hasTracked.current = true;
    }

    // Update ref to track current dialog state
    wasOpen.current = isDialogOpen;

    // Reset tracking flag when dialog closes
    if (!isDialogOpen) {
      hasTracked.current = false;
    }

    return () => {
      hasTracked.current = false;
      wasOpen.current = false;
    };
  }, [isDialogOpen, isCheckout]);

  return null;
}
