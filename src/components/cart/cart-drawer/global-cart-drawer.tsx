"use client";

import { useEffect, useRef, useState } from "react";

import dynamic from "next/dynamic";

import { CartDrawerSkeleton } from "@/components/cart/cart-drawer/cart-drawer-skeleton";
import { useCartDrawer } from "@/contexts/cart-drawer-context";

const SKELETON_MIN_DURATION_MS = 2500;

const CartDrawer = dynamic(
  () => import("@/components/cart/cart-drawer").then((mod) => mod.CartDrawer),
  {
    loading: () => <CartDrawerSkeleton />,
    ssr: false,
  }
);

export function GlobalCartDrawer() {
  const hasOpenedRef = useRef(false);
  const hasHeldSkeletonRef = useRef(false);
  const { isCartDrawerOpen } = useCartDrawer();
  const [holdSkeleton, setHoldSkeleton] = useState(false);

  if (isCartDrawerOpen) {
    hasOpenedRef.current = true;
  }

  useEffect(() => {
    if (!isCartDrawerOpen || hasHeldSkeletonRef.current) return;

    hasHeldSkeletonRef.current = true;
    setHoldSkeleton(true);

    const timer = setTimeout(
      () => setHoldSkeleton(false),
      SKELETON_MIN_DURATION_MS
    );

    return () => clearTimeout(timer);
  }, [isCartDrawerOpen]);

  if (!hasOpenedRef.current) {
    return null;
  }

  if (holdSkeleton) {
    return <CartDrawerSkeleton />;
  }

  return <CartDrawer />;
}
