import type { Ref } from "react";

import { ProductCardPriceCountdownIndicatorIconProps } from "@/components/product/product-card/product-card-price-countdown-indicator-content";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const ProductCardCountdownIndicatorPlaceholder = ({
  iconProps,
  sentinelRef,
}: {
  iconProps?: ProductCardPriceCountdownIndicatorIconProps;
  sentinelRef?: Ref<HTMLSpanElement>;
}) => (
  <span
    aria-hidden
    className={cn("size-3.5 shrink-0", iconProps?.className)}
    ref={sentinelRef}
  >
    <Skeleton className="size-full rounded-sm" />
  </span>
);
