"use client";

import Image, { type ImageProps } from "next/image";

import CountdownTimerIcon from "@/assets/icons/countdown-timer-icon.svg";
import { useProductCountdownTimer } from "@/hooks/product/use-product-countdown-timer";
import { cn } from "@/lib/utils";

import type { CountdownTimer } from "@/lib/types/product/countdown-timer";

export type ProductCardPriceCountdownIndicatorIconProps = Omit<
  ImageProps,
  "alt" | "height" | "src" | "width"
>;

export const ProductCardPriceCountdownIndicatorContent = ({
  countdownTimer,
  iconProps,
}: {
  countdownTimer?: CountdownTimer | null;
  iconProps?: ProductCardPriceCountdownIndicatorIconProps;
}) => {
  const { countdownData } = useProductCountdownTimer({
    countdownTimer,
  });

  if (!countdownTimer?.enabled || !countdownData) {
    return null;
  }

  return (
    <Image
      {...iconProps}
      alt=""
      className={cn("size-3.5 shrink-0", iconProps?.className)}
      height={15}
      src={CountdownTimerIcon}
      unoptimized
      width={15}
    />
  );
};
