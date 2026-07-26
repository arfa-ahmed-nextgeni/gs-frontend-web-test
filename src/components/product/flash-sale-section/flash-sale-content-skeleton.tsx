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
    <div className="relative lg:mb-28">
      <div
        aria-hidden
        className="bg-bg-success absolute inset-0 rounded-[15px] lg:hidden"
      />
      <div className="bg-bg-success lg:w-274.75 relative w-full rounded-[15px] px-5 pb-0 pt-5 lg:my-8 lg:h-[300px] lg:px-6 lg:pb-32 lg:pt-6">
        <Skeleton className="absolute end-4 top-4 hidden h-6 w-20 lg:end-8 lg:top-8 lg:block" />

        <div className="flex flex-col">
          <div className="flex-col">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-6 w-4 lg:h-9 lg:w-6" />
              <Skeleton className="h-8 w-40 lg:h-[51px] lg:w-48" />
            </div>
            <Skeleton className="w-70 mt-2 h-6 lg:h-7 lg:w-80" />
          </div>
          <div className="lg:inset-s-6 mt-3 lg:absolute lg:bottom-6 lg:mt-0">
            <FlashSaleCountdownSkeleton />
          </div>
        </div>
      </div>

      <div className="lg:-bottom-22.5 relative -me-2.5 mt-4 min-w-0 lg:absolute lg:end-0 lg:z-10 lg:me-0 lg:mt-0 lg:w-[700px] xl:w-[800px]">
        <div className="w-full">
          <CategoryProductsCarouselItemsSkeleton
            carouselProps={{
              className:
                "[&>[data-slot=scroll-snap-carousel-viewport]]:[scroll-padding-inline-end:0px] [&>[data-slot=scroll-snap-carousel-viewport]]:[scroll-padding-inline-start:1.25rem] lg:[&>[data-slot=scroll-snap-carousel-viewport]]:[scroll-padding-inline:0px]",
            }}
            contentProps={{
              className: "ps-5 pe-0 lg:ps-0 lg:pe-0",
            }}
            maximumProducts={4}
            variant={variant}
          />
        </div>
      </div>

      <Skeleton className="relative my-4 me-5 ms-auto h-6 w-16 lg:hidden" />
    </div>
  );
};
