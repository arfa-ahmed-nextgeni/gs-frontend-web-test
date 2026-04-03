"use client";

import { ComponentProps } from "react";

import { ProductCardPrice } from "@/components/product/product-card/product-card-price";
import { useProductDetails } from "@/contexts/product-details-context";
import { cn } from "@/lib/utils";

export const ProductDetailsPrice = ({
  containerProps,
}: {
  containerProps?: ComponentProps<"div">;
}) => {
  const { countdownTimer, product, selectedVariantIndex } = useProductDetails();

  return (
    <ProductCardPrice
      containerProps={{
        ...containerProps,
        className: cn("px-0 gap-5", containerProps?.className),
      }}
      countdownTimer={countdownTimer}
      countdownTimerIconProps={{
        className: "size-4 -me-5",
      }}
      oldPrice={
        product.variants[selectedVariantIndex]?.oldPrice || product.oldPrice
      }
      oldPriceClassName="text-lg font-normal"
      price={
        product.variants[selectedVariantIndex]?.price || product.price || ""
      }
      priceClassName="text-[25px] font-semibold"
    />
  );
};
