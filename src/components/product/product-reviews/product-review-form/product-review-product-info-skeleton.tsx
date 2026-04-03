import { Skeleton } from "@/components/ui/skeleton";

export const ProductReviewProductInfoSkeleton = () => {
  return (
    <div className="h-25 bg-bg-default flex w-full shrink-0 flex-row gap-2.5 rounded-xl p-2.5">
      <div className="relative aspect-square h-full overflow-hidden rounded-xl">
        <Skeleton className="size-full" />
      </div>
      <div className="flex flex-1 flex-col justify-between py-1">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
};
