import { PRODUCT_CARD_DIMENSIONS } from "@/lib/constants/product/product-card";
import { ProductCardVariant } from "@/lib/constants/product/product-card";
import { cn } from "@/lib/utils";

export function productCardSizeClasses(variant: ProductCardVariant) {
  const dim = PRODUCT_CARD_DIMENSIONS[variant];
  const { h: defH, w: defW } = dim.default;
  const { h: hovH, w: hovW } = dim.hover;
  const loadingSizeClasses =
    "group-has-[button[data-loading=true]]:w-[var(--card-hover-w)] group-has-[button[data-loading=true]]:h-[var(--card-hover-h)]";
  const loadingSmallScreenSizeClasses =
    "group-has-[button[data-loading=true]]:w-[80%]";

  return {
    className: cn(
      "w-[var(--card-w)] h-[var(--card-h)]",
      "group-hover:w-[var(--card-hover-w)] group-hover:h-[var(--card-hover-h)]",
      "group-focus-within:w-[var(--card-hover-w)] group-focus-within:h-[var(--card-hover-h)]",
      loadingSizeClasses,
      "max-[400px]:w-[90%] group-hover:w-[80%] group-focus-within:w-[80%]",
      loadingSmallScreenSizeClasses
    ),
    style: {
      "--card-h": `${defH}px`,
      "--card-hover-h": `${hovH}px`,
      "--card-hover-w": `${hovW}px`,
      "--card-w": `${defW}px`,
    } as React.CSSProperties,
  };
}
