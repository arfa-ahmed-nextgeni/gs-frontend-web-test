"use client";

import { ComponentProps } from "react";

import { useTranslations } from "next-intl";

import SectionHeader from "@/components/common/section-header";
import { ProductCard } from "@/components/product/product-card";
import { CarouselContainer } from "@/components/ui/carousel/carousel-container";
import { CarouselItem } from "@/components/ui/carousel/carousel-item";
import { CategoryProducts } from "@/lib/models/category-products";

export const CategoryProductsCarouselClient = ({
  carouselContainerProps,
  lpRow,
  products,
  richTitle,
  sectionHeaderProps,
  showClearHistory,
  showViewAll,
}: {
  carouselContainerProps?: ComponentProps<typeof CarouselContainer>;
  lpRow?: number;
  sectionHeaderProps?: ComponentProps<typeof SectionHeader>;
} & CategoryProducts) => {
  const t = useTranslations("HomePage.categoryProducts");

  return (
    <div className="gap-4.5 flex flex-col">
      <SectionHeader
        {...sectionHeaderProps}
        clearButton={{
          show: showClearHistory ?? false,
          text: t("clearHistory"),
        }}
        lpColumn={1}
        lpExtra={{
          type: "category-slider",
        }}
        lpRow={lpRow}
        richTitle={richTitle}
        seeAllButton={{
          href: sectionHeaderProps?.seeAllButton?.href || "/",
          show: showViewAll,
          text: t("seeAll"),
        }}
      />
      <CarouselContainer
        {...carouselContainerProps}
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
        {products?.map((product, index) => (
          <CarouselItem key={`${product.id}`}>
            <ProductCard
              lpColumn={1}
              lpExtra={{
                row_count: products?.length || 0,
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
    </div>
  );
};
