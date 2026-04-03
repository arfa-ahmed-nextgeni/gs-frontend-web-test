import { ComponentProps } from "react";

import { getLocale, getTranslations } from "next-intl/server";

import { CategoryProductGrid } from "@/components/category/products/category-product-grid";
import SectionHeader from "@/components/common/section-header";
import { ProductCard } from "@/components/product/product-card";
import { CarouselContainer } from "@/components/ui/carousel/carousel-container";
import { CarouselItem } from "@/components/ui/carousel/carousel-item";
import { getProductsByCategory } from "@/lib/actions/products/get-products-by-category";
import { Locale } from "@/lib/constants/i18n";
import { ProductCardVariant } from "@/lib/constants/product/product-card";
import { ROUTES } from "@/lib/constants/routes";
import { CategoryProducts } from "@/lib/models/category-products";
import { ProductCardModel } from "@/lib/models/product-card-model";
import { sleep } from "@/lib/utils/async";
import { isOk } from "@/lib/utils/service-result";

export const CategoryProductsCarouselContent = async ({
  carouselContainerProps,
  delayMs,
  grid,
  lpRow,
  maximumProducts,
  productsCategoryId,
  richTitle,
  sectionHeaderProps,
  showClearHistory,
  showViewAll,
  variant,
}: {
  carouselContainerProps?: ComponentProps<typeof CarouselContainer>;
  delayMs?: number;
  lpRow?: number;
  sectionHeaderProps?: ComponentProps<typeof SectionHeader>;
} & CategoryProducts) => {
  if (delayMs) {
    await sleep(delayMs);
  }

  const locale = (await getLocale()) as Locale;

  const t = await getTranslations("HomePage.categoryProducts");

  let products: ProductCardModel[] = [];

  const productsByCatergoryResponse = await getProductsByCategory({
    category: productsCategoryId,
    locale,
    pageSize: maximumProducts,
    variant,
  });

  if (isOk(productsByCatergoryResponse)) {
    products = productsByCatergoryResponse.data.products;
  }

  if (!products?.length) return null;

  const desktopGridColumns = variant === ProductCardVariant.Single ? 6 : 5;

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
          href: ROUTES.CATEGORY.BY_SLUG(productsCategoryId),
          show: showViewAll,
          text: t("seeAll"),
        }}
      />
      {grid ? (
        <CategoryProductGrid
          desktopColumns={desktopGridColumns}
          lpRow={lpRow}
          products={products}
        />
      ) : (
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
          {products.map((product, index) => (
            <CarouselItem key={`${product.id}-${index}`}>
              <ProductCard
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
      )}
    </div>
  );
};
