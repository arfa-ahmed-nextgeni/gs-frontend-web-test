import { AsyncBoundary } from "@/components/common/async-boundary";
import { CategoryProductsCarouselSkeleton } from "@/components/product/category-products-carousel-skeleton";
import { RecentlyViewedProductsSection } from "@/components/product/recently-viewed-products/recently-viewed-products-section";
import { ProductCardVariant } from "@/lib/constants/product/product-card";
import { RecentlyViewedProductsContent } from "@/lib/models/recently-viewed-products-content";

export function RecentlyViewedProducts({
  data,
  lpRow,
}: {
  data: RecentlyViewedProductsContent;
  lpRow?: number;
}) {
  if (!data.showRecentlyView) {
    return null;
  }

  return (
    <AsyncBoundary
      fallback={
        <CategoryProductsCarouselSkeleton
          maximumProducts={data.maximumProducts}
          variant={ProductCardVariant.Single}
        />
      }
    >
      <RecentlyViewedProductsSection data={data} lpRow={lpRow} />
    </AsyncBoundary>
  );
}
