"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";

import { SectionHeader } from "@/components/common/section-header";
import { CategoryProductsCarouselSkeleton } from "@/components/product/category-products-carousel-skeleton";
import { ProductCard } from "@/components/product/product-card";
import {
  CardRailScrollSnapCarousel,
  CardRailScrollSnapCarouselItem,
} from "@/components/ui/card-rail-scroll-snap-carousel";
import { useUI } from "@/contexts/use-ui";
import { useBulletDeliveryEnabled } from "@/hooks/use-bullet-delivery-enabled";
import { syncDeviceIdCookie } from "@/lib/actions/cookies/device-id";
import { appApiRequest } from "@/lib/clients/app-client";
import { type Locale } from "@/lib/constants/i18n";
import { ProductCardVariant } from "@/lib/constants/product/product-card";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { ROUTES } from "@/lib/constants/routes";
import { type ProductCardModel } from "@/lib/models/product-card-model";
import { type RecentlyViewedProductsContent } from "@/lib/models/recently-viewed-products-content";
import { getClientDeviceId } from "@/lib/utils/device-id";
import { isOk } from "@/lib/utils/service-result";

export function RecentlyViewedProductsSection({
  lpRow,
  maximumProducts,
  productsCategoryId,
  richTitle,
  showViewAll,
  viewAllUrl,
}: {
  lpRow?: number;
} & Pick<
  RecentlyViewedProductsContent,
  | "maximumProducts"
  | "productsCategoryId"
  | "richTitle"
  | "showViewAll"
  | "viewAllUrl"
>) {
  const locale = useLocale() as Locale;
  const { isAuthorized } = useUI();
  const audience = isAuthorized ? "customer" : "guest";
  const isBulletDeliveryEnabled = useBulletDeliveryEnabled();
  const {
    data = [],
    isError,
    isPending,
  } = useQuery({
    gcTime: Infinity,
    queryFn: async () => {
      if (audience === "guest") {
        await syncDeviceIdCookie({
          deviceId: await getClientDeviceId(),
          shouldRefresh: false,
        });
      }

      const response = await appApiRequest<{ products: ProductCardModel[] }>({
        endpoint: `/recently-viewed-products?locale=${locale}`,
      });

      return isOk(response) ? response.data.products : [];
    },
    queryKey: [...QUERY_KEYS.PRODUCTS.RECENTLY_VIEWED, locale, audience],
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: Infinity,
  });
  const t = useTranslations("HomePage.recentlyViewedProducts");
  const tCategoryProducts = useTranslations("HomePage.categoryProducts");

  if (isPending) {
    return (
      <CategoryProductsCarouselSkeleton
        maximumProducts={maximumProducts}
        variant={ProductCardVariant.Single}
      />
    );
  }

  if (isError) {
    return null;
  }

  const products = data.slice(0, maximumProducts);

  if (!products.length) {
    return null;
  }

  const seeAllHref =
    viewAllUrl ||
    (productsCategoryId ? ROUTES.CATEGORY.BY_SLUG(productsCategoryId) : "");

  return (
    <div className="gap-4.5 flex flex-col">
      <SectionHeader
        lpColumn={1}
        lpExtra={{
          type: "recently-viewed-products",
        }}
        lpRow={lpRow}
        richTitle={richTitle}
        sectionHeading={
          <p className="text-text-primary text-2xl font-normal rtl:font-semibold">
            {t.rich("title", {
              b: (chunks) => (
                <span className="font-semibold rtl:font-bold">{chunks}</span>
              ),
            })}
          </p>
        }
        seeAllButton={{
          href: seeAllHref,
          show: showViewAll && Boolean(seeAllHref),
          text: tCategoryProducts("seeAll"),
        }}
      />

      <CardRailScrollSnapCarousel
        carouselProps={{
          deferUntilInView: true,
        }}
        contentProps={{
          className: "gap-[9.6px]",
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
              isInCarousel
              lpColumn={1}
              lpExtra={{
                row_count: products.length,
                style: "horizontal",
                type: "recently-viewed-products",
              }}
              lpInnerPosition={index + 1}
              lpRow={lpRow}
              product={product}
            />
          </CardRailScrollSnapCarouselItem>
        ))}
      </CardRailScrollSnapCarousel>
    </div>
  );
}
