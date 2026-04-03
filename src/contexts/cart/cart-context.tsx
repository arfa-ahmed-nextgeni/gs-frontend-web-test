"use client";

import React from "react";

import { useCartQuery } from "@/hooks/queries/cart/use-cart-query";
import { Cart } from "@/lib/models/cart";

interface CartContextValue {
  cart?: Cart | null;
  cartHasItems: boolean;
  isFetching: boolean;
  isLoading?: boolean;
}

export const CartContext = React.createContext<CartContextValue | undefined>(
  undefined
);

export function CartProvider({ children }: React.PropsWithChildren<object>) {
  const { data: cart, isFetching, isLoading } = useCartQuery();

  const cartHasItems = !!cart?.totalQuantity;

  const value = React.useMemo(
    () => ({ cart, cartHasItems, isFetching, isLoading }),
    [cart, cartHasItems, isFetching, isLoading]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
