"use client";

import { useEffect } from "react";

import { CartLastAddedItem } from "@/components/cart/cart-drawer/cart-last-added-item";
import { DrawerContent } from "@/components/ui/drawer";

import { CartFreeShippingProgress } from "../cart-free-shipping-progress";
import { CartDrawerBody } from "./cart-drawer-body";
import { CartDrawerContainer } from "./cart-drawer-container";
import { CartDrawerFooter } from "./cart-drawer-footer";
import { CartDrawerHeader } from "./cart-drawer-header";
import { CartDrawerItemsList } from "./cart-drawer-items-list";
import { CartDrawerSubtotal } from "./cart-drawer-subtotal";
import { CartDrawerSuggestedItems } from "./cart-drawer-suggested-items";

export const CartDrawer = ({
  animated = true,
  onReady,
}: {
  animated?: boolean;
  onReady?: () => void;
}) => {
  // Signal to parent after the first open has had time to settle.
  // This keeps the drawer non-animated on the initial mount long enough to avoid the first-open flicker, while later opens can animate normally.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onReady?.();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [onReady]);
  return (
    <CartDrawerContainer>
      <DrawerContent
        animated={animated}
        className="bg-bg-body lg:w-107.5! z-99 flex flex-col border-none"
      >
        <CartDrawerHeader />
        <CartFreeShippingProgress />
        <CartDrawerBody>
          <CartLastAddedItem />
          <CartDrawerItemsList />
          <CartDrawerSuggestedItems />
        </CartDrawerBody>
        <CartDrawerSubtotal />
        <CartDrawerFooter />
      </DrawerContent>
    </CartDrawerContainer>
  );
};
