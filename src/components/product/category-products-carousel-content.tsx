import type { ComponentProps } from "react";

import { getLocale, getTranslations } from "next-intl/server";

import { CategoryProductGrid } from "@/components/category/products/category-product-grid";
import { SectionHeader } from "@/components/common/section-header";
import { ProductCard } from "@/components/product/product-card";
import {
  CardRailScrollSnapCarousel,
  CardRailScrollSnapCarouselItem,
} from "@/components/ui/card-rail-scroll-snap-carousel";
import { getBulletDeliveryEnabled } from "@/lib/actions/config/get-bullet-delivery-enabled";
import { getProductsByCategory } from "@/lib/actions/products/get-products-by-category";
import { Locale } from "@/lib/constants/i18n";
import { ProductCardVariant } from "@/lib/constants/product/product-card";
import { ROUTES } from "@/lib/constants/routes";
import { CategoryProducts } from "@/lib/models/category-products";
import { ProductCardModel } from "@/lib/models/product-card-model";
import { isOk } from "@/lib/utils/service-result";

export const CategoryProductsCarouselContent = async ({
  carouselContainerProps,
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
  carouselContainerProps?: ComponentProps<typeof CardRailScrollSnapCarousel>;
  lpRow?: number;
  sectionHeaderProps?: ComponentProps<typeof SectionHeader>;
} & CategoryProducts) => {
  const locale = (await getLocale()) as Locale;

  const [isBulletDeliveryEnabled, productsByCatergoryResponse, t] =
    await Promise.all([
      getBulletDeliveryEnabled({ locale }),
      getProductsByCategory({
        category: productsCategoryId,
        locale,
        pageSize: maximumProducts,
        variant,
      }),
      getTranslations("HomePage.categoryProducts"),
    ]);

  let products: ProductCardModel[] = [];

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
          isBulletDeliveryEnabled={isBulletDeliveryEnabled}
          lpRow={lpRow}
          products={products}
        />
      ) : (
        <CardRailScrollSnapCarousel
          {...carouselContainerProps}
          carouselProps={{
            ...carouselContainerProps?.carouselProps,
            deferUntilInView: true,
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
          {products.map((product, index) => (
            <CardRailScrollSnapCarouselItem key={`${product.id}-${index}`}>
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
      )}
    </div>
  );
};
