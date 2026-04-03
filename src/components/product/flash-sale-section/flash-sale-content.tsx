import { ComponentProps } from "react";

import { getLocale, getTranslations } from "next-intl/server";

import { FlashSaleResponsiveCountdown } from "@/components/product/flash-sale-section/flash-sale-responsive-countdown";
import { ProductCard } from "@/components/product/product-card";
import { ContentfulImage } from "@/components/shared/contentful-image";
import { CarouselContainer } from "@/components/ui/carousel/carousel-container";
import { CarouselItem } from "@/components/ui/carousel/carousel-item";
import { Link } from "@/i18n/navigation";
import { getBulletDeliveryEnabled } from "@/lib/actions/config/get-bullet-delivery-enabled";
import { getProductsByCategory } from "@/lib/actions/products/get-products-by-category";
import { Locale } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import { FlashSale } from "@/lib/models/flash-sale";
import { ProductCardModel } from "@/lib/models/product-card-model";
import { cn } from "@/lib/utils";
import { isOk } from "@/lib/utils/service-result";

export const FlashSaleContent = async ({
  autoSlideDelay,
  autoSliding,
  countdownContainerProps,
  desktopCarouselContainerProps,
  endTime,
  lpRow,
  maximumProducts,
  productsCategoryId,
  saleIcon,
  saleProductCategoryId,
  showViewAll,
  subtitle,
  title,
  variant,
}: {
  countdownContainerProps?: ComponentProps<"div">;
  desktopCarouselContainerProps?: ComponentProps<"div">;
  lpRow?: number;
} & FlashSale) => {
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

  return (
    <div className="relative mb-8 lg:mb-28">
      <div
        {...countdownContainerProps}
        className={cn(
          "bg-bg-success lg:w-274.75 relative my-4 h-[510px] w-full rounded-[15px] px-4 py-6 lg:my-8 lg:h-[300px] lg:px-6 lg:pb-32 lg:pt-6",
          countdownContainerProps?.className
        )}
      >
        {showViewAll && (
          <Link
            className="text-text-tertiary absolute end-4 top-4 hidden text-base font-normal lg:end-8 lg:top-7 lg:block"
            href={ROUTES.CATEGORY.BY_SLUG(productsCategoryId)}
          >
            {t("seeAll")}
          </Link>
        )}

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="flex flex-col">
            {/* Title and Subtitle */}
            <div className="flex-col">
              <div className="flex items-center gap-2.5">
                {saleIcon && (
                  <ContentfulImage
                    alt="Flash Sale"
                    height={36}
                    src={
                      saleIcon.startsWith("http")
                        ? saleIcon
                        : `https:${saleIcon}`
                    }
                    width={24}
                  />
                )}
                <span className="text-text-brand text-[51px] font-bold rtl:text-[45px]">
                  {title}
                </span>
              </div>
              <div className="text-text-primary w-[320px] text-[28px] font-normal">
                {subtitle}
              </div>
            </div>
            {/* Countdown Timer */}
            <div>
              {endTime && (
                <FlashSaleResponsiveCountdown
                  endTime={endTime}
                  visibleOn="desktop"
                />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="block lg:hidden">
          {/* Title and Subtitle */}
          <div className="mb-4">
            <div className="mb-4 flex items-center gap-2.5">
              {saleIcon && (
                <ContentfulImage
                  alt="Flash Sale"
                  height={36}
                  src={
                    saleIcon.startsWith("http") ? saleIcon : `https:${saleIcon}`
                  }
                  width={24}
                />
              )}
              <span className="text-[51.2px] font-bold leading-[32px] text-[#6543F5] rtl:text-4xl">
                {title}
              </span>
            </div>
            <div className="max-w-[280px] text-[20px] font-normal leading-[24px] text-[#415443]">
              {subtitle}
            </div>
          </div>

          {/* Timer and Products Side by Side */}
          <div className="relative flex items-end gap-6">
            {/* Countdown Timer */}
            <div className="w-[50px] flex-shrink-0">
              {endTime && (
                <FlashSaleResponsiveCountdown
                  endTime={endTime}
                  visibleOn="mobile"
                />
              )}
            </div>

            {/* Products */}
            <div className="relative min-w-0 flex-1">
              {Array.isArray(products) && products.length > 0 ? (
                <CarouselContainer
                  carouselProps={{
                    autoPlay: {
                      delay: autoSlideDelay,
                      enabled: autoSliding,
                    },
                    deferUntilInView: true,
                  }}
                  contentProps={{
                    className: "gap-3",
                  }}
                  nextButtonProps={{
                    className: "hidden", // Hide arrows on mobile
                  }}
                  previousButtonProps={{
                    className: "hidden", // Hide arrows on mobile
                  }}
                >
                  {products.map((product: any, index: number) => (
                    <CarouselItem
                      className="w-[190px] flex-shrink-0"
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
              ) : (
                <div className="p-4 text-center text-[#5D5D5D]">
                  No products available
                </div>
              )}

              {/* See All - Bottom Right (Mobile Only) */}
              {showViewAll && (
                <div className="absolute -bottom-10 end-2">
                  <Link
                    className="text-text-tertiary rounded px-2 py-1 text-base font-normal"
                    href={ROUTES.CATEGORY.BY_SLUG(productsCategoryId)}
                  >
                    {t("seeAll")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Cards - Only for Desktop (Overlapping) */}
      <div
        {...desktopCarouselContainerProps}
        className={cn(
          "-bottom-22.5 absolute end-0 z-10 hidden w-[700px] lg:block xl:w-[800px]",
          desktopCarouselContainerProps?.className
        )}
      >
        <div className="w-full">
          {Array.isArray(products) && products.length > 0 ? (
            <CarouselContainer
              carouselProps={{
                autoPlay: {
                  delay: autoSlideDelay,
                  enabled: autoSliding,
                },
                deferUntilInView: true,
              }}
              nextButtonProps={{
                className:
                  "absolute xl:translate-x-15 xl:rtl:-translate-x-15 top-1/2 -translate-y-1/2 z-10 text-[#374957]",
              }}
              nextIconProps={{
                fill: "#374957",
              }}
              previousButtonProps={{
                className:
                  "absolute -start-8 top-1/2 -translate-y-1/2 z-10 text-[#374957]",
              }}
              previousIconProps={{
                fill: "#ffffff",
                opacity: 1,
              }}
            >
              {products.map((product: any, index: number) => (
                <CarouselItem
                  className="max-w-[280px] flex-shrink-0"
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
          ) : (
            <div className="w-full rounded-2xl bg-white/20 p-8 text-center text-gray-600">
              {!saleProductCategoryId
                ? "No products or category ID configured in Contentful"
                : "No products found for this flash sale"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
