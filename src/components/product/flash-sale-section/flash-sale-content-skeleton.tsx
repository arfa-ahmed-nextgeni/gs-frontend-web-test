import { CategoryProductsCarouselItemsSkeleton } from "@/components/product/category-products-carousel-items-skeleton";
import { FlashSaleCountdownSkeleton } from "@/components/product/flash-sale-section/flash-sale-countdown-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardVariant } from "@/lib/constants/product/product-card";

export const FlashSaleContentSkeleton = ({
  variant = ProductCardVariant.Single,
}: {
  variant?: ProductCardVariant;
}) => {
  return (
    <div className="lg:mb-18 relative mb-8">
      <div className="bg-bg-success relative my-4 h-[510px] w-full rounded-[15px] px-4 py-6 lg:my-8 lg:h-[300px] lg:w-full lg:px-6 lg:pb-32 lg:pt-6">
        {/* See All Link - Desktop Only */}
        <Skeleton className="absolute end-4 top-4 hidden h-6 w-20 lg:end-8 lg:top-8 lg:block" />

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="flex flex-col">
            {/* Title and Subtitle */}
            <div className="mb-6">
              <div className="mb-6 flex items-center gap-2.5">
                <Skeleton className="h-9 w-6" />
                <Skeleton className="h-[51px] w-48" />
              </div>
              <Skeleton className="h-7 w-80" />
            </div>
            {/* Countdown Timer */}
            <FlashSaleCountdownSkeleton layout="desktop" />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="block lg:hidden">
          {/* Title and Subtitle */}
          <div className="mb-4">
            <div className="mb-4 flex items-center gap-2.5">
              <Skeleton className="h-9 w-6" />
              <Skeleton className="h-8 w-40" />
            </div>
            <Skeleton className="w-70 h-6" />
          </div>

          {/* Timer and Products Side by Side */}
          <div className="relative flex items-end gap-6">
            {/* Countdown Timer */}
            <div className="w-[50px] flex-shrink-0">
              <FlashSaleCountdownSkeleton layout="mobile" />
            </div>

            {/* Products */}
            <div className="relative min-w-0 flex-1">
              <CategoryProductsCarouselItemsSkeleton
                maximumProducts={4}
                variant={variant}
              />

              {/* See All - Bottom Right (Mobile Only) */}
              <Skeleton className="absolute -bottom-10 end-2 h-6 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Product Cards - Only for Desktop (Overlapping) */}
      <div className="absolute -bottom-20 end-2 z-10 hidden w-[700px] lg:block xl:w-[800px]">
        <div className="w-full">
          <CategoryProductsCarouselItemsSkeleton
            maximumProducts={4}
            variant={variant}
          />
        </div>
      </div>
    </div>
  );
};
