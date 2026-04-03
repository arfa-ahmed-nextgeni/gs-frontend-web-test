"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/use-cart";
import { cn } from "@/lib/utils";

interface CartDrawerSuggestedItemsSkeletonProps {
  containerClassNames?: string;
  valueClassNames?: string;
}

export const CartDrawerSuggestedItemsSkeleton = ({
  containerClassNames,
  valueClassNames,
}: CartDrawerSuggestedItemsSkeletonProps) => {
  const { cartHasItems } = useCart();

  if (!cartHasItems) return null;

  return (
    <div
      className={cn(
        "lg:mt-7.5 mb-5 mt-5 flex flex-col gap-5",
        containerClassNames
      )}
    >
      <div className="lg:border-border-base mx-5 lg:border-t lg:pt-4">
        <Skeleton className="h-6 w-52" />
      </div>

      <div
        className={cn(
          "flex flex-row gap-2.5 overflow-x-auto px-5",
          valueClassNames
        )}
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="h-25 w-65.75 min-w-65.75 bg-bg-default relative flex flex-row items-stretch overflow-hidden rounded-xl shadow-sm"
            key={index}
          >
            <Skeleton className="my-auto size-20 shrink-0 rounded-xl" />
            <div className="flex flex-1 flex-col justify-between px-3 py-2">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-2.5 w-full" />
                <Skeleton className="h-2.5 w-4/5" />
              </div>
              <div className="flex flex-row items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="size-7.5 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
