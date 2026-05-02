import { ProductCard } from "@/components/product/product-card";
import {
  CardRailScrollSnapCarousel,
  CardRailScrollSnapCarouselItem,
} from "@/components/ui/card-rail-scroll-snap-carousel";

import type { ProductCardModel } from "@/lib/models/product-card-model";

export const TopTrendsCarousel = ({
  autoSliding,
  carouselIdPrefix,
  isBulletDeliveryEnabled,
  lpRow,
  mode,
  products,
}: {
  autoSliding: {
    delay: number;
    enabled: boolean;
  };
  carouselIdPrefix: string;
  isBulletDeliveryEnabled: boolean;
  lpRow?: number;
  mode: "desktop" | "mobile";
  products: ProductCardModel[];
}) => {
  return (
    <CardRailScrollSnapCarousel
      carouselProps={{
        autoPlay: {
          delay: autoSliding.delay,
          enabled: autoSliding.enabled,
        },
        deferUntilInView: true,
      }}
      dotsProps={
        mode === "desktop"
          ? {
              className: "-bottom-10",
              visible: true,
            }
          : undefined
      }
      nextButtonProps={{
        className: "-end-9",
      }}
      nextIconProps={{
        fill: "#FFFFFF",
        opacity: 1,
      }}
      previousButtonProps={{
        className: "-start-9",
      }}
      previousIconProps={{
        fill: "#FFFFFF",
        opacity: 1,
      }}
    >
      {products.map((product, index) => (
        <CardRailScrollSnapCarouselItem
          id={`${carouselIdPrefix}-carousel-item-${index}`}
          key={product.id}
        >
          <ProductCard
            isBulletDeliveryEnabled={isBulletDeliveryEnabled}
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
