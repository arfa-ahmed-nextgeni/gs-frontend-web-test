import { ProductCardSkeleton } from "@/components/product/product-card/fallbacks/product-card-skeleton";
import {
  CardRailScrollSnapCarousel,
  CardRailScrollSnapCarouselItem,
} from "@/components/ui/card-rail-scroll-snap-carousel";
import { ProductCardVariant } from "@/lib/constants/product/product-card";

export const CategoryProductsCarouselItemsSkeleton = ({
  maximumProducts,
  variant,
}: {
  maximumProducts: number;
  variant: ProductCardVariant;
}) => {
  return (
    <CardRailScrollSnapCarousel
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
          <ProductCardSkeleton variant={variant} />
        </CardRailScrollSnapCarouselItem>
      ))}
    </CardRailScrollSnapCarousel>
  );
};
