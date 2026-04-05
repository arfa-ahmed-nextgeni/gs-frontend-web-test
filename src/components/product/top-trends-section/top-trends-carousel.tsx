import { ProductCard } from "@/components/product/product-card";
import { CarouselContainer } from "@/components/ui/carousel/carousel-container";
import { CarouselItem } from "@/components/ui/carousel/carousel-item";

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
    <CarouselContainer
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
              idPrefix: carouselIdPrefix,
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
        <CarouselItem
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
        </CarouselItem>
      ))}
    </CarouselContainer>
  );
};
