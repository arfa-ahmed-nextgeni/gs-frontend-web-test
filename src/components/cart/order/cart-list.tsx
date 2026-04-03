"use client";

import { CartItem as CartItemModel } from "@/lib/models/cart";

import { CartItem } from "./cart-item";

export function CartList({ items }: { items: CartItemModel[] }) {
  return (
    <>
      {items.map((item) => (
        <CartItem item={item} key={item.uidInCart ?? item.id} />
      ))}
    </>
  );
}
