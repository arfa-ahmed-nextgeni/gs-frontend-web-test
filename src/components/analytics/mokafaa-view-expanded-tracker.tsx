"use client";

import { useEffect, useRef } from "react";

import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { useRouteMatch } from "@/hooks/use-route-match";
import { trackMokafaaViewExpanded } from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";

/**
 * Client component to track mokafaa_view_expanded event
 * Placed in mokafaa dialog to track when the dialog is opened
 * Only tracks once per dialog open, even if cart data updates
 */
export function MokafaaViewExpandedTracker({
  isDialogOpen,
}: {
  isDialogOpen: boolean;
}) {
  const { cart, isLoading } = useCart();
  const { storeConfig } = useStoreConfig();
  const { isCheckout } = useRouteMatch();
  const hasTracked = useRef(false);
  const wasOpen = useRef(false);

  useEffect(() => {
    // Track when dialog opens (transitions from closed to open)
    if (
      !wasOpen.current &&
      isDialogOpen &&
      !isLoading &&
      cart &&
      !hasTracked.current
    ) {
      // Build cart properties using helper function
      const cartProperties = buildCartProperties(
        cart,
        isCheckout ? { storeConfig } : undefined
      );
      const paymentMethod = cart.selectedPaymentMethod?.code || "";
      trackMokafaaViewExpanded({
        ...cartProperties,
        payment_method: paymentMethod,
      });
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
  }, [isDialogOpen, cart, isLoading, storeConfig, isCheckout]);

  return null;
}
