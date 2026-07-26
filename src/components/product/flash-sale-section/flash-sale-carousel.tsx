import { ProductCard } from "@/components/product/product-card";
import {
  CardRailScrollSnapCarousel,
  CardRailScrollSnapCarouselItem,
} from "@/components/ui/card-rail-scroll-snap-carousel";

import type { ProductCardModel } from "@/lib/models/product-card-model";

export const FlashSaleCarousel = ({
  autoSlideDelay,
  autoSliding,
  isBulletDeliveryEnabled,
  lpRow,
  products,
}: {
  autoSlideDelay: number;
  autoSliding: boolean;
  isBulletDeliveryEnabled: boolean;
  lpRow?: number;
  products: ProductCardModel[];
}) => {
  return (
    <CardRailScrollSnapCarousel
      carouselProps={{
        autoPlay: {
          delay: autoSlideDelay,
          enabled: autoSliding,
        },
        className:
          "[&>[data-slot=scroll-snap-carousel-viewport]]:[scroll-padding-inline-end:0px] [&>[data-slot=scroll-snap-carousel-viewport]]:[scroll-padding-inline-start:1.25rem] lg:[&>[data-slot=scroll-snap-carousel-viewport]]:[scroll-padding-inline:0px]",
        deferUntilInView: true,
      }}
      contentProps={{
        className: "ps-5 pe-0 gap-2.5 lg:ps-0 lg:pe-0",
      }}
      nextButtonProps={{
        className:
          "absolute top-1/2 z-10 hidden -translate-y-1/2 lg:flex xl:translate-x-15 xl:rtl:-translate-x-15",
      }}
      nextIconProps={{
        fill: "#374957",
      }}
      previousButtonProps={{
        className:
          "absolute -start-8 top-1/2 z-10 hidden -translate-y-1/2 lg:flex",
      }}
      previousIconProps={{
        fill: "#ffffff",
        opacity: 1,
      }}
    >
      {products.map((product, index) => (
        <CardRailScrollSnapCarouselItem key={product.id}>
          <ProductCard
            isBulletDeliveryEnabled={isBulletDeliveryEnabled}
            isInCarousel
            lpColumn={1}
            lpExtra={{
              row_count: products.length,
              style: "horizontal",
              type: "category-slider",
            }}
            lpInnerPosition={index + 1}
            lpRow={lpRow}
            product={product}
          />
        </CardRailScrollSnapCarouselItem>
      ))}
    </CardRailScrollSnapCarousel>
  );
};
