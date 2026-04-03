import { getLocale, getTranslations } from "next-intl/server";

import SectionHeader from "@/components/common/section-header";
import { ProductCard } from "@/components/product/product-card";
import { TopTrendsBannerImage } from "@/components/product/top-trends-section/top-trends-banner-image";
import { TopTrendsCashbackCard } from "@/components/product/top-trends-section/top-trends-cashback-card";
import { CarouselContainer } from "@/components/ui/carousel/carousel-container";
import { CarouselItem } from "@/components/ui/carousel/carousel-item";
import { getProductsByCategory } from "@/lib/actions/products/get-products-by-category";
import { Locale } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import { ProductCardModel } from "@/lib/models/product-card-model";
import { TopTrendsCategoryProducts } from "@/lib/models/top-trends-category-products";
import { sleep } from "@/lib/utils/async";
import { isOk } from "@/lib/utils/service-result";

export const TopTrendsContent = async ({
  autoSliding,
  bannerColumn,
  bannerImages,
  bannerLpId,
  bannerOrigin,
  bannerRow,
  cashbackButtonTitle,
  cashbackButtonUrl,
  cashbackCurrencyImage,
  cashbackTitle,
  delayMs,
  lpRow,
  maximumProducts,
  productsCategoryId,
  richTitle,
  showViewAll,
  variant,
}: {
  bannerColumn?: number;
  bannerLpId?: string;
  bannerOrigin?: "lp" | "pdp" | "plp";
  bannerRow?: number;
  delayMs?: number;
  lpRow?: number;
} & TopTrendsCategoryProducts) => {
  if (delayMs) {
    await sleep(delayMs);
  }
  const locale = (await getLocale()) as Locale;

  const carouselIdPrefix = "top-trends";

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

  const t = await getTranslations("HomePage.categoryProducts");

  const renderCategoryProducts = () => {
    return products?.map((product, index) => (
      <CarouselItem
        id={`${carouselIdPrefix}-carousel-item-${index}`}
        key={`${product.id}`}
      >
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
    ));
  };

  return (
    <div className="gap-4.5 flex flex-col">
      {/* Top banner - mobile only */}
      <TopTrendsBannerImage
        bannerColumn={bannerColumn}
        bannerInnerPosition={2}
        bannerLpId={bannerLpId}
        bannerOrigin={bannerOrigin}
        bannerRow={bannerRow}
        bannerStyle="grid"
        bannerType="banners-in-grid"
        className="h-30 relative overflow-hidden rounded-2xl lg:hidden"
        elementId={bannerImages?.[2].elementId}
        imageProps={{
          alt: "Top Trends 3",
          fill: true,
          sizes: "(min-width: 1024px) 25vw, 100vw",
          src: bannerImages?.[2].mobile.url,
        }}
        redirectUrl={bannerImages?.[2].redirectUrl}
      />

      {/* Section Header */}
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
          {Array.isArray(products) && products.length > 0 && (
            <CarouselContainer
              carouselProps={{
                autoPlay: {
                  delay: autoSliding?.delay,
                  enabled: autoSliding?.enabled,
                },
              }}
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
              {renderCategoryProducts()}
            </CarouselContainer>
          )}
        </div>
      </div>

      {/* Desktop Section Header */}
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

      {/* Main Content Area */}
      <div className="lg:h-93.75 grid grid-cols-12 gap-2 lg:gap-2.5">
        {/* Mobile Layout */}
        <div className="col-span-12 lg:hidden">
          <div className="grid grid-cols-12 gap-2">
            <TopTrendsBannerImage
              bannerColumn={bannerColumn}
              bannerInnerPosition={1}
              bannerLpId={bannerLpId}
              bannerOrigin={bannerOrigin}
              bannerRow={bannerRow}
              bannerStyle="grid"
              bannerType="banners-in-grid"
              className="h-33.75 relative col-span-4 overflow-hidden rounded-2xl"
              elementId={bannerImages?.[1].elementId}
              imageProps={{
                alt: "Top Trends 2",
                fill: true,
                sizes: "(min-width: 1024px) 12.5vw, 25vw",
                src: bannerImages?.[1].mobile.url,
              }}
              redirectUrl={bannerImages?.[1].redirectUrl}
            />
            <div className="relative col-span-8 flex flex-col justify-between overflow-hidden">
              <TopTrendsCashbackCard
                buttonClassName="text-text-inverse bg-bg-brand flex w-24 items-center justify-center gap-2.5 overflow-hidden rounded-xl py-2.5 text-xs font-bold"
                buttonText={cashbackButtonTitle ?? ""}
                cashbackCurrencyImageUrl={cashbackCurrencyImage?.mobile.url}
                cashbackTitle={cashbackTitle}
                currencyClassName="h-16.25 w-16.75 absolute bottom-0 end-0"
                navigateTo={cashbackButtonUrl}
              />
            </div>
            <TopTrendsBannerImage
              bannerColumn={bannerColumn}
              bannerInnerPosition={3}
              bannerLpId={bannerLpId}
              bannerOrigin={bannerOrigin}
              bannerRow={bannerRow}
              bannerStyle="grid"
              bannerType="banners-in-grid"
              className="h-30 relative col-span-12 overflow-hidden rounded-2xl"
              elementId={bannerImages?.[0].elementId}
              imageProps={{
                alt: "Top Trends 1",
                fill: true,
                sizes: "(min-width: 1024px) 25vw, 100vw",
                src: bannerImages?.[0].mobile.url,
              }}
              redirectUrl={bannerImages?.[0].redirectUrl}
            />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="relative hidden lg:col-span-5 lg:block">
          <div className="h-82.25 bg-bg-success absolute bottom-0 w-full rounded-2xl" />
          <div className="relative">
            <div className="px-12">
              {Array.isArray(products) && products.length > 0 && (
                <CarouselContainer
                  carouselProps={{
                    autoPlay: {
                      delay: autoSliding?.delay,
                      enabled: autoSliding?.enabled,
                    },
                  }}
                  dotsProps={{
                    className: "-bottom-10",
                    idPrefix: carouselIdPrefix,
                    visible: true,
                  }}
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
                  {renderCategoryProducts()}
                </CarouselContainer>
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:col-span-7 lg:grid lg:grid-cols-7 lg:grid-rows-12 lg:gap-2.5">
          <TopTrendsBannerImage
            bannerColumn={bannerColumn}
            bannerInnerPosition={1}
            bannerLpId={bannerLpId}
            bannerOrigin={bannerOrigin}
            bannerRow={bannerRow}
            bannerStyle="grid"
            bannerType="banners-in-grid"
            className="relative col-span-5 row-span-7 overflow-hidden rounded-2xl"
            elementId={bannerImages?.[0].elementId}
            imageProps={{
              alt: "Top Trends 1",
              fill: true,
              sizes: "(min-width: 1024px) 25vw, 100vw",
              src: bannerImages?.[0].desktop.url,
            }}
            redirectUrl={bannerImages?.[0].redirectUrl}
          />
          <TopTrendsBannerImage
            bannerColumn={bannerColumn}
            bannerInnerPosition={2}
            bannerLpId={bannerLpId}
            bannerOrigin={bannerOrigin}
            bannerRow={bannerRow}
            bannerStyle="grid"
            bannerType="banners-in-grid"
            className="relative col-span-2 row-span-7 overflow-hidden rounded-2xl"
            elementId={bannerImages?.[1].elementId}
            imageProps={{
              alt: "Top Trends 2",
              fill: true,
              sizes: "(min-width: 1024px) 12.5vw, 25vw",
              src: bannerImages?.[1].desktop.url,
            }}
            redirectUrl={bannerImages?.[1].redirectUrl}
          />
          <div className="relative col-span-3 row-span-5 flex flex-col justify-between overflow-hidden">
            <TopTrendsCashbackCard
              buttonClassName="text-text-inverse bg-bg-brand flex w-24 items-center justify-center gap-2.5 overflow-hidden rounded-xl rounded-bl-2xl py-2.5 text-xs font-bold"
              buttonText={cashbackButtonTitle ?? ""}
              cashbackCurrencyImageUrl={cashbackCurrencyImage?.desktop.url}
              cashbackTitle={cashbackTitle}
              currencyClassName="h-17.5 w-17.5 absolute bottom-0 end-0"
              navigateTo={cashbackButtonUrl}
            />
          </div>
          <TopTrendsBannerImage
            bannerColumn={bannerColumn}
            bannerInnerPosition={3}
            bannerLpId={bannerLpId}
            bannerOrigin={bannerOrigin}
            bannerRow={bannerRow}
            bannerStyle="grid"
            bannerType="banners-in-grid"
            className="relative col-span-4 row-span-5 overflow-hidden rounded-2xl"
            elementId={bannerImages?.[2].elementId}
            imageProps={{
              alt: "Top Trends 3",
              fill: true,
              sizes: "(min-width: 1024px) 25vw, 100vw",
              src: bannerImages?.[2].desktop.url,
            }}
            redirectUrl={bannerImages?.[2].redirectUrl}
          />
        </div>
      </div>
    </div>
  );
};
