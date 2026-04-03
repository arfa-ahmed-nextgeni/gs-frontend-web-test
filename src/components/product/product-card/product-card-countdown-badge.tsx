"use client";

import { type PropsWithChildren } from "react";

import dynamic from "next/dynamic";

import { useProductCardVisibilityLoad } from "@/components/product/product-card/hooks/use-product-card-visibility-load";
import { useProductCardCountdownVisibility } from "@/components/product/product-card/product-card-countdown-visibility-context";

import type { ProductCardModel } from "@/lib/models/product-card-model";

const ProductCardCountdownBadgeContent = dynamic(
  () =>
    import("@/components/product/product-card/product-card-countdown-badge-content").then(
      (module) => module.ProductCardCountdownBadgeContent
    ),
  {
    ssr: false,
  }
);

export const ProductCardCountdownBadge = ({
  children,
  countdownTimer,
}: PropsWithChildren<{
  countdownTimer?: ProductCardModel["countdownTimer"];
}>) => {
  const sharedShouldLoad = useProductCardCountdownVisibility();
  const isSharedVisibilityEnabled = sharedShouldLoad !== null;
  const { sentinelRef, shouldLoad: localShouldLoad } =
    useProductCardVisibilityLoad<HTMLSpanElement>({
      disabled: isSharedVisibilityEnabled,
      rootMargin: "120px 0px",
    });
  const shouldLoad = sharedShouldLoad ?? localShouldLoad;

  return shouldLoad ? (
    <ProductCardCountdownBadgeContent countdownTimer={countdownTimer}>
      {children}
    </ProductCardCountdownBadgeContent>
  ) : (
    <>
      {isSharedVisibilityEnabled ? null : (
        <span aria-hidden className="sr-only" ref={sentinelRef} />
      )}
      {children}
    </>
  );
};
