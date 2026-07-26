"use client";

import { useEffect, useRef, useState } from "react";

import dynamic from "next/dynamic";

import { CartDrawerSkeleton } from "@/components/cart/cart-drawer/cart-drawer-skeleton";
import { useCartDrawer } from "@/contexts/cart-drawer-context";

const CartDrawer = dynamic(
  () => import("@/components/cart/cart-drawer").then((mod) => mod.CartDrawer),
  { ssr: false }
);

export function GlobalCartDrawer() {
  const hasOpenedRef = useRef(false);
  const prevIsOpenRef = useRef(false);
  const { isCartDrawerOpen } = useCartDrawer();
  const [isCartDrawerReady, setIsCartDrawerReady] = useState(false);
  const [hasCompletedFirstOpen, setHasCompletedFirstOpen] = useState(false);

  if (isCartDrawerOpen) {
    hasOpenedRef.current = true;
  }

  // Keep the very first drawer open non-animated to avoid the initial flicker.
  // Only enable animations after the first open cycle fully completes (close).
  useEffect(() => {
    if (prevIsOpenRef.current && !isCartDrawerOpen && !hasCompletedFirstOpen) {
      setHasCompletedFirstOpen(true);
    }
    prevIsOpenRef.current = isCartDrawerOpen;
  }, [hasCompletedFirstOpen, isCartDrawerOpen]);

  if (!hasOpenedRef.current) {
    return null;
  }

  return (
    <>
      {/* Skeleton stays visible until the real drawer signals it is mounted, but rendered on top of the real drawer via z-index.*/}
      {!isCartDrawerReady && (
        <div className="z-100 pointer-events-none fixed inset-0">
          <CartDrawerSkeleton />
        </div>
      )}
      <CartDrawer
        animated={hasCompletedFirstOpen}
        onReady={() => setIsCartDrawerReady(true)}
      />
    </>
  );
}
