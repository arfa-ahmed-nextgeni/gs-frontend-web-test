import { ComponentProps } from "react";

import { ProductCardPriceCountdownIndicator } from "@/components/product/product-card/product-card-price-countdown-indicator";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { CountdownTimer } from "@/lib/types/product/countdown-timer";
import { cn } from "@/lib/utils";

import type { ProductCardPriceCountdownIndicatorIconProps } from "@/components/product/product-card/product-card-price-countdown-indicator-content";

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
  countdownTimerIconProps?: ProductCardPriceCountdownIndicatorIconProps;
  oldPrice?: string;
  oldPriceClassName?: string;
  price: string;
  priceClassName?: string;
}) => {
  return (
    <div
      {...containerProps}
      className={cn(
        "flex flex-row items-center gap-1 px-5",
        containerProps?.className
      )}
    >
      {countdownTimer?.enabled ? (
        <ProductCardPriceCountdownIndicator
          countdownTimer={countdownTimer}
          iconProps={countdownTimerIconProps}
        />
      ) : null}
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
