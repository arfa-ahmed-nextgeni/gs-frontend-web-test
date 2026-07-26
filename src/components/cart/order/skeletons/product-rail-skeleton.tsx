import { ProductCardSkeleton } from "@/components/product/product-card/fallbacks/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardVariant } from "@/lib/constants/product/product-card";
import { cn } from "@/lib/utils";

export function CartProductRailSkeleton({
  className,
  headerClassName,
  maximumProducts = 10,
}: {
  className?: string;
  headerClassName?: string;
  maximumProducts?: number;
}) {
  const mobileItems = Array.from({ length: Math.min(maximumProducts, 4) });
  const desktopItems = Array.from({ length: maximumProducts });

  return (
    <div className={cn("mb-7.5 !px-0", className)}>
      <div
        className={cn(
          "relative mb-5 flex flex-row items-center px-2 lg:px-0",
          headerClassName
        )}
      >
        <Skeleton className="h-7.5 w-40" />
      </div>

      <div className="scrollbar-none flex flex-row gap-2.5 overflow-x-auto lg:hidden">
        {mobileItems.map((_, index) => (
          <ProductCardMiniSkeleton key={`mini-skeleton-${index}`} />
        ))}
      </div>

      <div className="scrollbar-none hidden flex-row gap-2.5 overflow-x-auto lg:flex">
        {desktopItems.map((_, index) => (
          <div className="shrink-0" key={`product-skeleton-${index}`}>
            <ProductCardSkeleton
              isInCarousel
              variant={ProductCardVariant.Single}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductCardMiniSkeleton() {
  return (
    <div className="h-25 w-65.75 min-w-65.75 bg-bg-default relative flex flex-row items-stretch overflow-hidden rounded-xl shadow-sm">
      <div className="absolute top-0 z-10 flex scale-[0.85] flex-row gap-0.5 ltr:origin-top-left rtl:origin-top-right">
        <Skeleton className="h-6.25 bg-label-accent-light w-12 rounded-xl" />
        <Skeleton className="h-6.25 bg-label-alert-light w-8 rounded-xl" />
      </div>

      <Skeleton className="my-auto size-20 shrink-0 rounded-xl" />

      <div className="flex flex-1 flex-col justify-between px-3 py-2">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>

        <div className="flex flex-row items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="size-7.5 rounded-full" />
        </div>
      </div>
    </div>
  );
}
