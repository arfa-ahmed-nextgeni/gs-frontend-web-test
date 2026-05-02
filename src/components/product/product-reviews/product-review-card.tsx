import { ComponentProps } from "react";

import { ProductRating } from "@/components/product/product-rating";
import { ProductReviewDate } from "@/components/product/product-reviews/product-review-date";
import { ProductReviewVoteButtons } from "@/components/product/product-reviews/product-review-vote-buttons";
import { cn } from "@/lib/utils";

// import { ProductReviewReportButton } from "@/components/product/product-reviews/product-review-report-button";

export const ProductReviewCard = ({
  author,
  containerProps,
  date,
  message,
  productId,
  rating,
  reviewId,
}: {
  author: string;
  containerProps?: ComponentProps<"div">;
  date: string;
  message: string;
  productId: number;
  rating: number;
  reviewId: number;
}) => {
  return (
    <div
      {...containerProps}
      className={cn(
        "w-72.75 h-40.25 bg-bg-default flex flex-col justify-between rounded-xl p-5",
        containerProps?.className
      )}
    >
      <div className="flex flex-row items-start justify-between">
        <ProductRating rating={rating} />
        {/* <ProductReviewReportButton reviewId={reviewId} /> */}
      </div>
      <p className="text-text-primary line-clamp-2 text-sm font-medium">
        {message}
      </p>
      <p className="text-text-tertiary line-clamp-1 text-xs font-normal">
        {author}
      </p>
      <div className="flex flex-row items-end justify-between">
        <ProductReviewDate date={date} />
        <ProductReviewVoteButtons productId={productId} reviewId={reviewId} />
      </div>
    </div>
  );
};
