"use client";

import { useEffect, useRef } from "react";

import { useRouteMatch } from "@/hooks/use-route-match";
import { trackCartPromocodeViewExpand } from "@/lib/analytics/events";

/**
 * Client component to track cart_promocode_view_expand event
 * Placed in coupon dialog to track when the dialog opens in cart page
 */
export function CartPromocodeViewExpandTracker({
  isDialogOpen,
}: {
  isDialogOpen: boolean;
}) {
  const { isCart } = useRouteMatch();
  const hasTracked = useRef(false);
  const wasOpen = useRef(false);

  useEffect(() => {
    // Track when dialog opens (transitions from closed to open) in cart page
    if (!wasOpen.current && isDialogOpen && isCart && !hasTracked.current) {
      trackCartPromocodeViewExpand();
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
  }, [isDialogOpen, isCart]);

  return null;
}
