import { ProductRating } from "@/components/product/product-rating";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductReviewsSummarySkeleton = () => {
  return (
    <div className="h-11.25 flex flex-row justify-between px-5">
      <div className="flex flex-1 flex-row gap-1.5">
        <Skeleton className="border-border-base relative aspect-square h-full shrink-0 rounded-xl border" />
        <div className="flex flex-col justify-center">
          <Skeleton className="h-3.75 w-4/5" />
          <Skeleton className="h-3.75 w-4/5" />
        </div>
      </div>
      <div className="flex flex-1 flex-row items-start justify-end gap-2.5">
        <Skeleton className="w-16.5 h-full" />
        <div className="flex h-full flex-col justify-between">
          <ProductRating hideRating rating={4} variant="large" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    </div>
  );
};
