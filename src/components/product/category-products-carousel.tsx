import { ComponentProps } from "react";

import { AsyncBoundary } from "@/components/common/async-boundary";
import { SectionHeader } from "@/components/common/section-header";
import { CategoryProductsCarouselContent } from "@/components/product/category-products-carousel-content";
import { CategoryProductsCarouselSkeleton } from "@/components/product/category-products-carousel-skeleton";
import { CarouselContainer } from "@/components/ui/carousel/carousel-container";
import { CategoryProducts } from "@/lib/models/category-products";

export const CategoryProductsCarousel = async (
  props: {
    carouselContainerProps?: ComponentProps<typeof CarouselContainer>;
    lpRow?: number;
    sectionHeaderProps?: ComponentProps<typeof SectionHeader>;
  } & CategoryProducts
) => {
  return (
    <AsyncBoundary
      fallback={
        <CategoryProductsCarouselSkeleton
          grid={props.grid}
          maximumProducts={props.maximumProducts}
          variant={props.variant}
        />
      }
    >
      <CategoryProductsCarouselContent {...props} lpRow={props.lpRow} />
    </AsyncBoundary>
  );
};
