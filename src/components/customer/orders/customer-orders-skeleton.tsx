import { ComponentProps } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const CustomerOrdersSkeleton = ({
  containerProps,
}: {
  containerProps?: ComponentProps<"div">;
}) => {
  return (
    <div
      {...containerProps}
      className={cn("flex flex-col gap-4", containerProps?.className)}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
        <div className="flex items-center gap-2"></div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-3 lg:grid-cols-2 lg:gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <OrderCardSkeleton key={index} />
        ))}
      </div>

      <div className="flex justify-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};

const OrderCardSkeleton = () => {
  return (
    <div className="bg-bg-default border-border-base w-full rounded-xl border p-2 sm:p-4 lg:p-3">
      <div className="flex h-[100px] items-start justify-between sm:h-[114px]">
        <div className="flex flex-col space-y-2 sm:space-y-3.5">
          <div className="flex flex-col space-y-1">
            <Skeleton className="h-3 w-12 sm:w-16" />
            <Skeleton className="h-4 w-24 sm:w-32" />
          </div>
          <div className="flex flex-col space-y-1">
            <Skeleton className="h-3 w-16 sm:w-20" />
            <Skeleton className="h-4 w-20 sm:w-28" />
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2 sm:space-y-3.5">
          <div className="flex flex-col items-end space-y-1">
            <Skeleton className="h-3 w-8 sm:w-12" />
            <Skeleton className="h-4 w-12 sm:w-16" />
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                className="h-4 w-4 rounded-full sm:h-5 sm:w-5"
                key={index}
              />
            ))}
            <Skeleton className="h-3 w-3 sm:h-4 sm:w-4" />
          </div>
        </div>
      </div>

      <div className="border-border-base flex items-center justify-between border-t pt-2 sm:pt-2.5">
        <Skeleton className="h-5 w-16 rounded-xl sm:h-6 sm:w-20" />
        <div className="flex items-center gap-1 sm:gap-2">
          <Skeleton className="h-3 w-3 sm:h-4 sm:w-4" />
          <Skeleton className="h-3 w-8 sm:h-4 sm:w-12" />
        </div>
      </div>
    </div>
  );
};
