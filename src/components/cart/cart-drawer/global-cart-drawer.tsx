"use client";

import { useRef } from "react";

import dynamic from "next/dynamic";

import { CartDrawerSkeleton } from "@/components/cart/cart-drawer/cart-drawer-skeleton";
import { useCartDrawer } from "@/contexts/cart-drawer-context";

const CartDrawer = dynamic(
  () => import("@/components/cart/cart-drawer").then((mod) => mod.CartDrawer),
  {
    loading: () => <CartDrawerSkeleton />,
    ssr: false,
  }
);

export function GlobalCartDrawer() {
  const { isCartDrawerOpen } = useCartDrawer();
  const hasOpenedRef = useRef(false);

  if (isCartDrawerOpen) {
    hasOpenedRef.current = true;
  }

  if (!hasOpenedRef.current) {
    return null;
  }

  return <CartDrawer />;
}
