import { ProductReviewsListSkeleton } from "@/components/product/product-reviews/product-reviews-view/product-reviews-list-skeleton";
import { ProductReviewsSummarySkeleton } from "@/components/product/product-reviews/product-reviews-view/product-reviews-summary-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductReviewsViewSkeleton = () => {
  return (
    <div className="flex h-full flex-col">
      <div className="gap-3.75 flex flex-1 flex-col overflow-y-auto py-5 pb-20 lg:pb-5">
        <ProductReviewsSummarySkeleton />
        <ProductReviewsListSkeleton />
      </div>

      <div className="bg-bg-default border-border-base lg:pb-30 fixed bottom-0 left-0 right-0 flex border-t px-5 py-2.5 lg:static lg:pt-5">
        <div className="bg-btn-bg-primary h-12.5 text-text-inverse flex w-full items-center justify-center rounded-xl text-xl font-medium">
          <Skeleton className="h-5 w-2/5" />
        </div>
      </div>
    </div>
  );
};
