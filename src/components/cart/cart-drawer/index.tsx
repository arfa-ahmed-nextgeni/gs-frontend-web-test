"use client";

import { useEffect, useRef, useState } from "react";

import { CartLastAddedItem } from "@/components/cart/cart-drawer/cart-last-added-item";
import { DrawerContent } from "@/components/ui/drawer";
import { useCartDrawer } from "@/contexts/cart-drawer-context";

import { CartFreeShippingProgress } from "../cart-free-shipping-progress";
import { CartDrawerBody } from "./cart-drawer-body";
import { CartDrawerContainer } from "./cart-drawer-container";
import { CartDrawerFooter } from "./cart-drawer-footer";
import { CartDrawerHeader } from "./cart-drawer-header";
import { CartDrawerItemsList } from "./cart-drawer-items-list";
import { CartDrawerSubtotal } from "./cart-drawer-subtotal";
import { CartDrawerSuggestedItems } from "./cart-drawer-suggested-items";

export const CartDrawer = () => {
  const { isCartDrawerOpen } = useCartDrawer();
  const hasCompletedFirstCycleRef = useRef(false);
  const previousOpenRef = useRef(isCartDrawerOpen);
  const [isDrawerAnimated, setIsDrawerAnimated] = useState(false);

  useEffect(() => {
    // Enable animation only after the first full open -> close cycle.
    // This avoids turning animation on during the initial lazy-load open.
    if (
      !hasCompletedFirstCycleRef.current &&
      previousOpenRef.current &&
      !isCartDrawerOpen
    ) {
      hasCompletedFirstCycleRef.current = true;
      setIsDrawerAnimated(true);
    }

    previousOpenRef.current = isCartDrawerOpen;
  }, [isCartDrawerOpen]);

  return (
    <CartDrawerContainer>
      <DrawerContent
        animated={isDrawerAnimated}
        className="bg-bg-body lg:!w-107.5 z-99 flex flex-col border-none"
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
