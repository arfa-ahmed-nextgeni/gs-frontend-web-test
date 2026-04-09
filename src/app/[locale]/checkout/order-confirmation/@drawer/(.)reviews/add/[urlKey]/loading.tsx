import { ProductReviewFormLayout } from "@/components/product/product-reviews/product-review-form/product-review-form-layout";
import { ProductReviewProductInfoSkeleton } from "@/components/product/product-reviews/product-review-form/product-review-product-info-skeleton";

export default function Loading() {
  return (
    <ProductReviewFormLayout>
      <ProductReviewProductInfoSkeleton />
    </ProductReviewFormLayout>
  );
}
