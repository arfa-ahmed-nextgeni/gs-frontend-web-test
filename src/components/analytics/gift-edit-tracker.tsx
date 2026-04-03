"use client";

import { useEffect, useRef } from "react";

import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { useRouteMatch } from "@/hooks/use-route-match";
import { trackGiftEdit } from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";

/**
 * Client component to track gift_edit event when gift wrapping page opens in edit mode
 * Placed in add-gift-wrapping drawer layout to track when users open the page to edit a gift
 */
export function GiftEditTracker({
  defaultSelectedGiftId,
  isEditMode,
}: {
  defaultSelectedGiftId: null | string;
  isEditMode: boolean;
}) {
  const { cart } = useCart();
  const { storeConfig } = useStoreConfig();
  const { isCheckout } = useRouteMatch();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (isEditMode && cart && defaultSelectedGiftId && !hasTracked.current) {
      const cartProperties = buildCartProperties(
        cart,
        isCheckout ? { storeConfig } : undefined
      );
      cartProperties["cart.gift_wrap.id"] = defaultSelectedGiftId;
      trackGiftEdit(cartProperties);
      hasTracked.current = true;
    }

    return () => {
      hasTracked.current = false;
    };
  }, [isEditMode, cart, defaultSelectedGiftId, isCheckout, storeConfig]);

  return null;
}
