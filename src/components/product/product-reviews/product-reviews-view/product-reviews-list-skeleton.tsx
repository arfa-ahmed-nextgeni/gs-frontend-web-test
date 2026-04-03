import { ProductReviewCardSkeleton } from "@/components/product/product-reviews/product-review-card-skeleton";

export const ProductReviewsListSkeleton = () => {
  return (
    <div className="flex flex-col gap-2.5 px-5">
      {[...Array(5)].map((_, index) => (
        <ProductReviewCardSkeleton
          containerProps={{
            className: "w-full",
          }}
          key={`review-${index}`}
        />
      ))}
    </div>
  );
};
