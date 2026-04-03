import { CategoryProductsCarouselItemsSkeleton } from "@/components/product/category-products-carousel-items-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardVariant } from "@/lib/constants/product/product-card";

export const TopTrendsContentSkeleton = ({
  variant = ProductCardVariant.Single,
}: {
  variant?: ProductCardVariant;
}) => {
  return (
    <div className="gap-4.5 flex flex-col">
      {/* Top banner - mobile only */}
      <Skeleton className="h-30 relative overflow-hidden rounded-2xl lg:hidden" />

      {/* Section Header - Mobile */}
      <div className="w-[calc(100dvw-10px)] lg:hidden">
        <div className="gap-4.5 relative flex flex-col ps-3 pt-5">
          <div className="h-75 bg-bg-success absolute start-0 top-0 w-full rounded-s-2xl" />
          <div className="flex items-center justify-between pe-5">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-20" />
          </div>
          <CategoryProductsCarouselItemsSkeleton
            maximumProducts={2}
            variant={variant}
          />
        </div>
      </div>

      {/* Desktop Section Header */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:h-93.75 grid grid-cols-12 gap-2 lg:gap-2.5">
        {/* Mobile Layout */}
        <div className="col-span-12 lg:hidden">
          <div className="grid grid-cols-12 gap-2">
            <Skeleton className="h-33.75 relative col-span-4 overflow-hidden rounded-2xl" />
            <div className="relative col-span-8 flex flex-col justify-between overflow-hidden rounded-2xl">
              <div className="flex flex-col gap-2 p-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-10 w-24 rounded-xl" />
              </div>
              <Skeleton className="h-16.25 w-16.75 absolute bottom-0 end-0" />
            </div>
            <Skeleton className="h-30 relative col-span-12 overflow-hidden rounded-2xl" />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="relative hidden lg:col-span-5 lg:block">
          <div className="h-82.25 bg-bg-success absolute bottom-0 w-full rounded-2xl" />
          <div className="relative px-12">
            <CategoryProductsCarouselItemsSkeleton
              maximumProducts={2}
              variant={variant}
            />
            <div className="relative -bottom-10 flex justify-center gap-1">
              {[...Array(4)].map((_, index) => (
                <Skeleton className="h-2 w-2 rounded-full" key={index} />
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:col-span-7 lg:grid lg:grid-cols-7 lg:grid-rows-12 lg:gap-2.5">
          <Skeleton className="relative col-span-5 row-span-7 overflow-hidden rounded-2xl" />
          <Skeleton className="relative col-span-2 row-span-7 overflow-hidden rounded-2xl" />
          <div className="relative col-span-3 row-span-5 flex flex-col justify-between overflow-hidden rounded-2xl">
            <div className="flex flex-col gap-2 p-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
            <Skeleton className="h-17.5 w-17.5 absolute bottom-0 end-0" />
          </div>
          <Skeleton className="relative col-span-4 row-span-5 overflow-hidden rounded-2xl" />
        </div>
      </div>
    </div>
  );
};
