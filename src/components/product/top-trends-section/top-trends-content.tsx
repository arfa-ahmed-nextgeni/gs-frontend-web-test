import { getLocale, getTranslations } from "next-intl/server";

import { SectionHeader } from "@/components/common/section-header";
import { TopTrendsBannerSlot } from "@/components/product/top-trends-section/top-trends-banner-slot";
import { TopTrendsCarousel } from "@/components/product/top-trends-section/top-trends-carousel";
import { getBulletDeliveryEnabled } from "@/lib/actions/config/get-bullet-delivery-enabled";
import { getProductsByCategory } from "@/lib/actions/products/get-products-by-category";
import { Locale } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import { TopTrendsCategoryProducts } from "@/lib/models/top-trends-category-products";
import { getIsMobileRequest } from "@/lib/utils/request-device";
import { isOk } from "@/lib/utils/service-result";

import type { ProductCardModel } from "@/lib/models/product-card-model";

export const TopTrendsContent = async ({
  autoSliding,
  bannerColumn,
  bannerLpId,
  bannerOrigin,
  bannerRow,
  desktopBannerImages,
  lpRow,
  maximumProducts,
  mobileBannerImages,
  productsCategoryId,
  richTitle,
  showViewAll,
  variant,
}: {
  bannerColumn?: number;
  bannerLpId?: string;
  bannerOrigin?: "lp" | "pdp" | "plp";
  bannerRow?: number;
  lpRow?: number;
} & TopTrendsCategoryProducts) => {
  const locale = (await getLocale()) as Locale;

  const carouselIdPrefix = "top-trends";

  const [
    isBulletDeliveryEnabled,
    isMobileRequest,
    productsByCatergoryResponse,
    t,
  ] = await Promise.all([
    getBulletDeliveryEnabled({ locale }),
    getIsMobileRequest(),
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

  return (
    <div className="gap-4.5 flex flex-col">
      {isMobileRequest && (
        <TopTrendsBannerSlot
          alt="Top Trends 1"
          banner={mobileBannerImages?.[0]}
          bannerColumn={bannerColumn}
          bannerInnerPosition={1}
          bannerLpId={bannerLpId}
          bannerOrigin={bannerOrigin}
          bannerRow={bannerRow}
          className="h-30 relative overflow-hidden rounded-2xl lg:hidden"
          device="mobile"
          sizes="(min-width: 1024px) 25vw, 100vw"
        />
      )}

      {isMobileRequest ? (
        <div className="w-[calc(100dvw-10px)] lg:hidden">
          <div className="gap-4.5 relative flex flex-col ps-3 pt-5">
            <div className="h-75 bg-bg-success absolute start-0 top-0 w-full rounded-s-2xl" />
            <SectionHeader
              className="lg-pe-auto pe-5"
              lpColumn={1}
              lpExtra={{
                type: "top-trends",
              }}
              lpRow={lpRow}
              richTitle={richTitle}
              sectionHeadingClassName="text-text-brand lg:text-text-primary"
              seeAllButton={{
                href: ROUTES.CATEGORY.BY_SLUG(productsCategoryId),
                show: showViewAll,
                text: t("seeAll"),
              }}
            />
            <TopTrendsCarousel
              autoSliding={autoSliding}
              carouselIdPrefix={carouselIdPrefix}
              isBulletDeliveryEnabled={isBulletDeliveryEnabled}
              lpRow={lpRow}
              mode="mobile"
              products={products}
            />
          </div>
        </div>
      ) : (
        <div className="hidden lg:block">
          <SectionHeader
            lpColumn={1}
            lpExtra={{
              type: "top-trends",
            }}
            lpRow={lpRow}
            richTitle={richTitle}
            seeAllButton={{
              href: ROUTES.CATEGORY.BY_SLUG(productsCategoryId),
              show: showViewAll,
              text: t("seeAll"),
            }}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="lg:h-93.75 grid grid-cols-12 gap-2 lg:gap-2.5">
        {isMobileRequest ? (
          <div className="col-span-12 lg:hidden">
            <div className="grid grid-cols-12 gap-2">
              <TopTrendsBannerSlot
                alt="Top Trends 2"
                banner={mobileBannerImages?.[1]}
                bannerColumn={bannerColumn}
                bannerInnerPosition={2}
                bannerLpId={bannerLpId}
                bannerOrigin={bannerOrigin}
                bannerRow={bannerRow}
                className="h-33.75 relative col-span-4 overflow-hidden rounded-2xl"
                device="mobile"
                sizes="(min-width: 1024px) 12.5vw, 25vw"
              />
              <TopTrendsBannerSlot
                alt="Top Trends 3"
                banner={mobileBannerImages?.[2]}
                bannerColumn={bannerColumn}
                bannerInnerPosition={3}
                bannerLpId={bannerLpId}
                bannerOrigin={bannerOrigin}
                bannerRow={bannerRow}
                className="h-33.75 relative col-span-8 overflow-hidden rounded-2xl"
                device="mobile"
                sizes="(min-width: 1024px) 25vw, 75vw"
              />
              <TopTrendsBannerSlot
                alt="Top Trends 4"
                banner={mobileBannerImages?.[3]}
                bannerColumn={bannerColumn}
                bannerInnerPosition={4}
                bannerLpId={bannerLpId}
                bannerOrigin={bannerOrigin}
                bannerRow={bannerRow}
                className="h-30 relative col-span-12 overflow-hidden rounded-2xl"
                device="mobile"
                sizes="(min-width: 1024px) 25vw, 100vw"
              />
            </div>
          </div>
        ) : (
          <div className="relative hidden lg:col-span-5 lg:block">
            <div className="h-82.25 bg-bg-success absolute bottom-0 w-full rounded-2xl" />
            <div className="relative">
              <div className="px-12">
                <TopTrendsCarousel
                  autoSliding={autoSliding}
                  carouselIdPrefix={carouselIdPrefix}
                  isBulletDeliveryEnabled={isBulletDeliveryEnabled}
                  lpRow={lpRow}
                  mode="desktop"
                  products={products}
                />
              </div>
            </div>
          </div>
        )}

        {!isMobileRequest && (
          <div className="hidden lg:col-span-7 lg:grid lg:grid-cols-7 lg:grid-rows-12 lg:gap-2.5">
            <TopTrendsBannerSlot
              alt="Top Trends 1"
              banner={desktopBannerImages?.[0]}
              bannerColumn={bannerColumn}
              bannerInnerPosition={1}
              bannerLpId={bannerLpId}
              bannerOrigin={bannerOrigin}
              bannerRow={bannerRow}
              className="relative col-span-5 row-span-7 overflow-hidden rounded-2xl"
              device="desktop"
              sizes="(min-width: 1024px) 25vw, 100vw"
            />
            <TopTrendsBannerSlot
              alt="Top Trends 2"
              banner={desktopBannerImages?.[1]}
              bannerColumn={bannerColumn}
              bannerInnerPosition={2}
              bannerLpId={bannerLpId}
              bannerOrigin={bannerOrigin}
              bannerRow={bannerRow}
              className="relative col-span-2 row-span-7 overflow-hidden rounded-2xl"
              device="desktop"
              sizes="(min-width: 1024px) 12.5vw, 25vw"
            />
            <TopTrendsBannerSlot
              alt="Top Trends 3"
              banner={desktopBannerImages?.[2]}
              bannerColumn={bannerColumn}
              bannerInnerPosition={3}
              bannerLpId={bannerLpId}
              bannerOrigin={bannerOrigin}
              bannerRow={bannerRow}
              className="relative col-span-3 row-span-5 overflow-hidden rounded-2xl"
              device="desktop"
              sizes="(min-width: 1024px) 18.75vw, 25vw"
            />
            <TopTrendsBannerSlot
              alt="Top Trends 4"
              banner={desktopBannerImages?.[3]}
              bannerColumn={bannerColumn}
              bannerInnerPosition={4}
              bannerLpId={bannerLpId}
              bannerOrigin={bannerOrigin}
              bannerRow={bannerRow}
              className="relative col-span-4 row-span-5 overflow-hidden rounded-2xl"
              device="desktop"
              sizes="(min-width: 1024px) 25vw, 100vw"
            />
          </div>
        )}
      </div>
    </div>
  );
};
