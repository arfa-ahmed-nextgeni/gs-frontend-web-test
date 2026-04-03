import { ProductReviewCardSkeleton } from "@/components/product/product-reviews/product-review-card-skeleton";
import Container from "@/components/shared/container";
import { CarouselContainer } from "@/components/ui/carousel/carousel-container";
import { CarouselItem } from "@/components/ui/carousel/carousel-item";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductReviewsCarouselSkeleton = () => {
  return (
    <Container className="mb-7.5 !px-0">
      <div className="gap-4.5 flex flex-col">
        <Skeleton className="w-43 h-8" />
        <CarouselContainer
          contentProps={{
            className: "px-2.5 lg:!px-0",
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
            <CarouselItem key={`review-${index}`}>
              <ProductReviewCardSkeleton />
            </CarouselItem>
          ))}
        </CarouselContainer>
        <Skeleton className="h-8.75 w-32.75" />
      </div>
    </Container>
  );
};
