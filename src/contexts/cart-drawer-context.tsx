"use client";

import { createContext, useCallback, useContext, useState } from "react";

import { useCart } from "@/contexts/use-cart";
import {
  trackMicroCartClose,
  trackViewMicrocart,
} from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";

export type CartDrawerContextType = {
  closeCartDrawer: () => void;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
};

const CartDrawerContext = createContext<CartDrawerContextType | undefined>(
  undefined
);

export const CartDrawerProvider = ({ children }: React.PropsWithChildren) => {
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const { cart } = useCart();

  const openCartDrawer = useCallback(() => {
    setIsCartDrawerOpen(true);
    const cartProperties = cart ? buildCartProperties(cart) : undefined;
    trackViewMicrocart(cartProperties);
  }, [cart]);

  const closeCartDrawer = useCallback(() => {
    if (isCartDrawerOpen) {
      const cartProperties = cart ? buildCartProperties(cart) : undefined;
      trackMicroCartClose(cartProperties);
    }
    setIsCartDrawerOpen(false);
  }, [isCartDrawerOpen, cart]);

  return (
    <CartDrawerContext.Provider
      value={{ closeCartDrawer, isCartDrawerOpen, openCartDrawer }}
    >
      {children}
    </CartDrawerContext.Provider>
  );
};

export const useCartDrawer = () => {
  const context = useContext(CartDrawerContext);
  if (!context) {
    throw new Error("useCartDrawer must be used within a CartDrawerProvider");
  }
  return context;
};
