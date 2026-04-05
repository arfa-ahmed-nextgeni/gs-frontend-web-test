import { ProductCard } from "@/components/product/product-card";
import { CarouselContainer } from "@/components/ui/carousel/carousel-container";
import { CarouselItem } from "@/components/ui/carousel/carousel-item";

import type { ProductCardModel } from "@/lib/models/product-card-model";

export const FlashSaleCarousel = ({
  autoSlideDelay,
  autoSliding,
  isBulletDeliveryEnabled,
  lpRow,
  mode,
  products,
}: {
  autoSlideDelay: number;
  autoSliding: boolean;
  isBulletDeliveryEnabled: boolean;
  lpRow?: number;
  mode: "desktop" | "mobile";
  products: ProductCardModel[];
}) => {
  return (
    <CarouselContainer
      carouselProps={{
        autoPlay: {
          delay: autoSlideDelay,
          enabled: autoSliding,
        },
        deferUntilInView: true,
      }}
      contentProps={
        mode === "mobile"
          ? {
              className: "gap-3",
            }
          : undefined
      }
      nextButtonProps={
        mode === "mobile"
          ? {
              className: "hidden",
            }
          : {
              className:
                "absolute xl:translate-x-15 xl:rtl:-translate-x-15 top-1/2 -translate-y-1/2 z-10 text-[#374957]",
            }
      }
      nextIconProps={
        mode === "mobile"
          ? undefined
          : {
              fill: "#374957",
            }
      }
      previousButtonProps={
        mode === "mobile"
          ? {
              className: "hidden",
            }
          : {
              className:
                "absolute -start-8 top-1/2 -translate-y-1/2 z-10 text-[#374957]",
            }
      }
      previousIconProps={
        mode === "mobile"
          ? undefined
          : {
              fill: "#ffffff",
              opacity: 1,
            }
      }
    >
      {products.map((product, index) => (
        <CarouselItem
          className={
            mode === "mobile"
              ? "w-[190px] flex-shrink-0"
              : "max-w-[280px] flex-shrink-0"
          }
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
