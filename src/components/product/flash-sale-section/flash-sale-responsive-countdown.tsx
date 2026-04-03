"use client";

import { FlashSaleCountdown } from "@/components/product/flash-sale-section/flash-sale-countdown";
import { useIsMobile } from "@/hooks/use-is-mobile";

export const FlashSaleResponsiveCountdown = ({
  endTime,
  visibleOn,
}: {
  endTime: string;
  visibleOn: "desktop" | "mobile";
}) => {
  const isMobile = useIsMobile();
  const shouldRender = visibleOn === "mobile" ? isMobile : !isMobile;

  if (!shouldRender) {
    return null;
  }

  return <FlashSaleCountdown endTime={endTime} layout={visibleOn} />;
};
