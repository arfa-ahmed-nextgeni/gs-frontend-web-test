"use client";

import { withVisibilityLoad } from "@/components/hoc/with-visibility-load";
import { FlashSaleCountdownSkeleton } from "@/components/product/flash-sale-section/flash-sale-countdown-skeleton";

export const FlashSaleCountdown = withVisibilityLoad<
  {
    endTime: string;
    layout: "desktop" | "mobile";
  },
  HTMLDivElement
>({
  displayName: "FlashSaleCountdown",
  loader: () =>
    import("@/components/product/flash-sale-section/flash-sale-countdown-content").then(
      (module) => ({
        default: module.FlashSaleCountdownContent,
      })
    ),
  renderFallback: ({ props, sentinelRef }) => (
    <FlashSaleCountdownSkeleton
      layout={props.layout}
      sentinelRef={sentinelRef}
    />
  ),
  rootMargin: "200px 0px",
});
