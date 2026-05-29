import { connection } from "next/server";

import { AsyncBoundary } from "@/components/common/async-boundary";
import { ProductReviewsCarousel } from "@/components/product/product-reviews/product-reviews-section/product-reviews-carousel";
import { ProductReviewsCarouselSkeleton } from "@/components/product/product-reviews/product-reviews-section/product-reviews-carousel-skeleton";
import { ProductType } from "@/lib/constants/product/product-details";
import { ProductDetailsModel } from "@/lib/models/product-details-model";

export const ProductReviewsSection = ({
  product,
}: {
  product: ProductDetailsModel;
}) => {
  if (product.type && [ProductType.EGiftCard].includes(product.type)) {
    return null;
  }

  return (
    <AsyncBoundary fallback={<ProductReviewsCarouselSkeleton />}>
      <ProductReviewsLeaf product={product} />
    </AsyncBoundary>
  );
};

const ProductReviewsLeaf = async ({
  product,
}: {
  product: ProductDetailsModel;
}) => {
  await connection();
  return <ProductReviewsCarousel product={product} />;
};
