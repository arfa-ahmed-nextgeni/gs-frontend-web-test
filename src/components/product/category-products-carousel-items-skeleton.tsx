import type { ComponentProps } from "react";

import { ProductCardSkeleton } from "@/components/product/product-card/fallbacks/product-card-skeleton";
import {
  CardRailScrollSnapCarousel,
  CardRailScrollSnapCarouselItem,
} from "@/components/ui/card-rail-scroll-snap-carousel";
import { ProductCardVariant } from "@/lib/constants/product/product-card";
import { cn } from "@/lib/utils";

export const CategoryProductsCarouselItemsSkeleton = ({
  carouselProps,
  contentProps,
  maximumProducts,
  variant,
}: {
  carouselProps?: ComponentProps<
    typeof CardRailScrollSnapCarousel
  >["carouselProps"];
  contentProps?: ComponentProps<
    typeof CardRailScrollSnapCarousel
  >["contentProps"];
  maximumProducts: number;
  variant: ProductCardVariant;
}) => {
  return (
    <CardRailScrollSnapCarousel
      carouselProps={carouselProps}
      contentProps={{
        ...contentProps,
        className: cn("gap-[9.6px]", contentProps?.className),
      }}
      nextButtonProps={{
        className: "xl:translate-x-15 xl:rtl:-translate-x-15",
      }}
      nextIconProps={{
        fill: "#374957",
      }}
      previousButtonProps={{
        className: "xl:-translate-x-15 xl:rtl:translate-x-15",
      }}
      previousIconProps={{
        fill: "#374957",
      }}
    >
      {[...Array(maximumProducts)].map((_, index) => (
        <CardRailScrollSnapCarouselItem key={index}>
          <ProductCardSkeleton isInCarousel variant={variant} />
        </CardRailScrollSnapCarouselItem>
      ))}
    </CardRailScrollSnapCarousel>
  );
};
