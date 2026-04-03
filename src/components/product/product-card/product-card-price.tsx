"use client";

import { ComponentProps } from "react";

import { CountdownTimerIcon } from "@/components/icons/countdown-timer-icon";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { useProductCountdownTimer } from "@/hooks/product/use-product-countdown-timer";
import { CountdownTimer } from "@/lib/types/product/countdown-timer";
import { cn } from "@/lib/utils";

export const ProductCardPrice = ({
  containerProps,
  countdownTimer,
  countdownTimerIconProps,
  oldPrice,
  oldPriceClassName,
  price,
  priceClassName,
}: {
  containerProps?: ComponentProps<"div">;
  countdownTimer?: CountdownTimer | null;
  countdownTimerIconProps?: ComponentProps<typeof CountdownTimerIcon>;
  oldPrice?: string;
  oldPriceClassName?: string;
  price: string;
  priceClassName?: string;
}) => {
  const { countdownData } = useProductCountdownTimer({
    countdownTimer,
  });

  return (
    <div
      {...containerProps}
      className={cn(
        "flex flex-row items-center gap-1 px-5",
        containerProps?.className
      )}
    >
      {countdownTimer?.enabled && !!countdownData && (
        <CountdownTimerIcon
          {...countdownTimerIconProps}
          className={cn(
            "size-3.5 flex-shrink-0",
            countdownTimerIconProps?.className
          )}
        />
      )}
      <LocalizedPrice
        containerProps={{
          className: cn(
            "text-base font-semibold",
            oldPrice ? "text-text-danger" : "text-text-primary",
            priceClassName
          ),
        }}
        price={price}
      />
      {oldPrice && (
        <LocalizedPrice
          containerProps={{
            className: cn(
              "font-gilroy text-text-secondary text-xs font-normal",
              oldPriceClassName
            ),
          }}
          price={oldPrice}
          valueProps={{
            className: "line-through",
          }}
        />
      )}
    </div>
  );
};
