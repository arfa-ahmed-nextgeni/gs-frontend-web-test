import { Suspense } from "react";

import { ProductReviewsCarousel } from "@/components/product/product-reviews/product-reviews-section/product-reviews-carousel";
import { ProductReviewsCarouselSkeleton } from "@/components/product/product-reviews/product-reviews-section/product-reviews-carousel-skeleton";
import { ProductType } from "@/lib/constants/product/product-details";
import { ProductDetailsModel } from "@/lib/models/product-details-model";

export const ProductReviewsSection = ({
  product,
}: {
  product: ProductDetailsModel;
}) => {
  if ([ProductType.EGiftCard].includes(product.type)) {
    return null;
  }

  return (
    <Suspense fallback={<ProductReviewsCarouselSkeleton />}>
      <ProductReviewsCarousel product={product} />
    </Suspense>
  );
};
