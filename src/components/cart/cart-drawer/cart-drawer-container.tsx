"use client";

import { PropsWithChildren, useEffect, useRef } from "react";

import { useDirection } from "@radix-ui/react-direction";

import { Drawer } from "@/components/ui/drawer";
import { useCartDrawer } from "@/contexts/cart-drawer-context";
import { useCart } from "@/contexts/use-cart";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { usePathname } from "@/i18n/navigation";

export const CartDrawerContainer = ({ children }: PropsWithChildren) => {
  const direction = useDirection();
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);

  const { cart } = useCart();

  const isMobile = useIsMobile();

  const { closeCartDrawer, isCartDrawerOpen } = useCartDrawer();

  useEffect(() => {
    if (cart?.items.length === 0) {
      closeCartDrawer();
    }
  }, [cart?.items.length, closeCartDrawer]);

  useEffect(() => {
    if (previousPathnameRef.current !== pathname && isCartDrawerOpen) {
      closeCartDrawer();
    }

    previousPathnameRef.current = pathname;
  }, [pathname, isCartDrawerOpen, closeCartDrawer]);

  return (
    <Drawer
      direction={isMobile ? "bottom" : direction === "ltr" ? "right" : "left"}
      onOpenChange={(open) => {
        if (!open) {
          closeCartDrawer();
        }
      }}
      open={isCartDrawerOpen}
    >
      {children}
    </Drawer>
  );
};
