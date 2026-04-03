import { productCardSizeClasses } from "@/components/product/product-card/utils/product-card-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardVariant } from "@/lib/constants/product/product-card";
import { cn } from "@/lib/utils";

export const ProductCardSkeleton = ({
  variant,
}: {
  variant: ProductCardVariant;
}) => {
  const { className, style } = productCardSizeClasses(variant);

  return (
    <div
      className={cn(
        "h-77.5 transition-default bg-bg-default group relative overflow-hidden rounded-xl",
        "sm:w-43 w-[calc(50vw-15px)]",
        "lg:w-48",
        "[contain-intrinsic-size:192px_310px] [content-visibility:auto]",
        {
          "[contain-intrinsic-size:240px_310px] lg:w-60":
            variant === ProductCardVariant.Bundles,
        }
      )}
    >
      <div
        className={cn(
          "transition-default relative mx-2.5 mt-2.5 overflow-hidden rounded-xl group-focus-within:mx-5 group-focus-within:mt-5 group-hover:mx-5 group-hover:mt-5",
          className
        )}
        style={style}
      >
        <Skeleton className="size-full" />
      </div>

      <div className="absolute start-1.5 top-1.5 flex flex-row gap-0.5">
        <Skeleton className="h-6.25 bg-label-accent-light group-focus-within:bg-label-accent-medium group-hover:bg-label-accent-medium w-12 rounded-xl" />
        <Skeleton className="h-6.25 bg-label-alert-light w-8 rounded-xl" />
      </div>

      <div className="relative mt-1 flex flex-col gap-1 px-5">
        <div className="flex flex-row items-center justify-between">
          <Skeleton className="w-21 h-4" />
          <Skeleton className="w-6.5 h-3.5" />
        </div>
        <div className="flex flex-col gap-0.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>

      <div className="mt-1 px-5">
        <Skeleton className="w-12.5 h-5" />
      </div>

      <div className="mt-3 px-5">
        <div className="transition-default flex flex-row flex-wrap gap-0.5 opacity-100 group-focus-within:opacity-0 group-hover:opacity-0">
          <Skeleton className="h-6.25 w-15 rounded-xl" />
          <Skeleton className="h-6.25 w-15 rounded-xl" />
        </div>
      </div>

      <div className="transition-default absolute bottom-0 flex w-full translate-y-9 flex-row items-center justify-between px-5 group-focus-within:-translate-y-3 group-hover:-translate-y-3">
        <Skeleton className="h-8.75 w-25 rounded-xl" />
        <Skeleton className="size-5 rounded-full" />
      </div>
    </div>
  );
};
