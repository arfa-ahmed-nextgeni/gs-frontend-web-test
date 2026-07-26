import { ProductReviewCardSkeleton } from "@/components/product/product-reviews/product-review-card-skeleton";
import Container from "@/components/shared/container";
import { CardRailScrollSnapCarousel } from "@/components/ui/card-rail-scroll-snap-carousel";
import { ScrollSnapCarouselItem } from "@/components/ui/scroll-snap-carousel";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductReviewsCarouselSkeleton = () => {
  return (
    <Container className="mb-7.5 !px-0">
      <div className="gap-4.5 flex flex-col">
        <Skeleton className="w-43 h-8 px-2.5 lg:px-0" />
        <CardRailScrollSnapCarousel
          carouselProps={{
            className:
              "[&>[data-slot=scroll-snap-carousel-viewport]]:[scroll-padding-inline:0.625rem] lg:[&>[data-slot=scroll-snap-carousel-viewport]]:[scroll-padding-inline:0px]",
          }}
          contentProps={{
            className: "w-max ps-2.5 pe-2.5 lg:ps-0 lg:pe-0",
          }}
          nextButtonProps={{
            className: "xl:translate-x-15 xl:rtl:-translate-x-15",
          }}
          nextIconProps={{
            fill: "#374957",
          }}
          previousButtonProps={{
            className: "xl:-translate-x-15 xl:rtl:translate-x-15",
          }}
          previousIconProps={{
            fill: "#374957",
          }}
        >
          {[...Array(4)].map((_, index) => (
            <ScrollSnapCarouselItem key={`review-${index}`}>
              <ProductReviewCardSkeleton />
            </ScrollSnapCarouselItem>
          ))}
        </CardRailScrollSnapCarousel>
        <Skeleton className="h-8.75 w-32.75" />
      </div>
    </Container>
  );
};
