"use client";

import { withVisibilityLoad } from "@/components/hoc/with-visibility-load";
import { FlashSaleCountdownSkeleton } from "@/components/product/flash-sale-section/flash-sale-countdown-skeleton";

export const FlashSaleCountdown = withVisibilityLoad<
  {
    endTime: string;
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
  renderFallback: ({ sentinelRef }) => (
    <FlashSaleCountdownSkeleton sentinelRef={sentinelRef} />
  ),
  rootMargin: "200px 0px",
});
