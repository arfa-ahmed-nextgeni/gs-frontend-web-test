import { AsyncBoundary } from "@/components/common/async-boundary";
import { RecentlyViewedProductsContent } from "@/lib/models/recently-viewed-products-content";

import { RecentlyViewedProductsSection } from "./recently-viewed-products-section";
import { RecentlyViewedProductsSkeleton } from "./recently-viewed-products-skeleton";

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
        <RecentlyViewedProductsSkeleton
          maximumProducts={data.maximumProducts}
        />
      }
    >
      <RecentlyViewedProductsSection data={data} lpRow={lpRow} />
    </AsyncBoundary>
  );
}
