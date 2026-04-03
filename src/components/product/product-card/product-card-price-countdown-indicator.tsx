"use client";

import { lazy } from "react";

import { AsyncBoundary } from "@/components/common/async-boundary";
import { ProductCardCountdownIndicatorPlaceholder } from "@/components/product/product-card/fallbacks/product-card-countdown-indicator-placeholder";
import { useProductCardVisibilityLoad } from "@/components/product/product-card/hooks/use-product-card-visibility-load";
import { useProductCardCountdownVisibility } from "@/components/product/product-card/product-card-countdown-visibility-context";

import type { ProductCardPriceCountdownIndicatorIconProps } from "@/components/product/product-card/product-card-price-countdown-indicator-content";
import type { CountdownTimer } from "@/lib/types/product/countdown-timer";

const ProductCardPriceCountdownIndicatorContent = lazy(() =>
  import("@/components/product/product-card/product-card-price-countdown-indicator-content").then(
    (module) => ({
      default: module.ProductCardPriceCountdownIndicatorContent,
    })
  )
);

export const ProductCardPriceCountdownIndicator = ({
  countdownTimer,
  iconProps,
}: {
  countdownTimer?: CountdownTimer | null;
  iconProps?: ProductCardPriceCountdownIndicatorIconProps;
}) => {
  const sharedShouldLoad = useProductCardCountdownVisibility();
  const isSharedVisibilityEnabled = sharedShouldLoad !== null;
  const { sentinelRef, shouldLoad: localShouldLoad } =
    useProductCardVisibilityLoad<HTMLSpanElement>({
      disabled: isSharedVisibilityEnabled,
      rootMargin: "120px 0px",
    });
  const shouldLoad = sharedShouldLoad ?? localShouldLoad;

  return shouldLoad ? (
    <AsyncBoundary
      loadingFallback={
        <ProductCardCountdownIndicatorPlaceholder iconProps={iconProps} />
      }
    >
      <ProductCardPriceCountdownIndicatorContent
        countdownTimer={countdownTimer}
        iconProps={iconProps}
      />
    </AsyncBoundary>
  ) : (
    <ProductCardCountdownIndicatorPlaceholder
      iconProps={iconProps}
      sentinelRef={isSharedVisibilityEnabled ? undefined : sentinelRef}
    />
  );
};
