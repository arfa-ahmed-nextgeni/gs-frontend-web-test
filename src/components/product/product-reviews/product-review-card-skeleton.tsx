import { ComponentProps } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const ProductReviewCardSkeleton = ({
  containerProps,
}: {
  containerProps?: ComponentProps<"div">;
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
        <Skeleton className="w-18.5 h-2.5" />
        <Skeleton className="h-1 w-5" />
      </div>
      <div className="flex flex-col gap-1">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      <Skeleton className="w-2/8 h-4" />
      <div className="flex flex-row items-end justify-between">
        <Skeleton className="w-2/8 h-4" />
        <div className="gap-7.5 flex flex-row">
          <Skeleton className="size-5" />
          <Skeleton className="size-5" />
        </div>
      </div>
    </div>
  );
};
