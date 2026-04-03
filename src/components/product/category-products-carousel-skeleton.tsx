import { ProductGridSkeleton } from "@/components/category/skeletons/product-grid-skeleton";
import { SectionHeaderSkeleton } from "@/components/common/section-header-skeleton";
import { CategoryProductsCarouselItemsSkeleton } from "@/components/product/category-products-carousel-items-skeleton";
import { ProductCardVariant } from "@/lib/constants/product/product-card";

export const CategoryProductsCarouselSkeleton = ({
  grid,
  maximumProducts,
  variant,
}: {
  grid?: boolean;
  maximumProducts: number;
  variant: ProductCardVariant;
}) => {
  return (
    <div className="gap-4.5 flex flex-col">
      <SectionHeaderSkeleton />
      {grid ? (
        <ProductGridSkeleton
          count={maximumProducts}
          desktopColumns={variant === ProductCardVariant.Single ? 6 : 5}
          variant={variant}
        />
      ) : (
        <CategoryProductsCarouselItemsSkeleton
          maximumProducts={maximumProducts}
          variant={variant}
        />
      )}
    </div>
  );
};
