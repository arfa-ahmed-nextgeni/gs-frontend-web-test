import { ProductCardSkeleton } from "@/components/product/product-card/product-card-skeleton";
import { CarouselContainer } from "@/components/ui/carousel/carousel-container";
import { CarouselItem } from "@/components/ui/carousel/carousel-item";
import { ProductCardVariant } from "@/lib/constants/product/product-card";

export const CategoryProductsCarouselItemsSkeleton = ({
  maximumProducts,
  variant,
}: {
  maximumProducts: number;
  variant: ProductCardVariant;
}) => {
  return (
    <CarouselContainer
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
        <CarouselItem key={index}>
          <ProductCardSkeleton variant={variant} />
        </CarouselItem>
      ))}
    </CarouselContainer>
  );
};
