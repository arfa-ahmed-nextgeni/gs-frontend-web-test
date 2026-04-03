import { ProductReviewsDrawerLayout } from "@/components/product/product-reviews/product-reviews-view/product-reviews-drawer-layout";
import { ProductReviewsViewSkeleton } from "@/components/product/product-reviews/product-reviews-view/product-reviews-view-skeleton";

export default function ProductReviewsLoading() {
  return (
    <ProductReviewsDrawerLayout>
      <ProductReviewsViewSkeleton />
    </ProductReviewsDrawerLayout>
  );
}
