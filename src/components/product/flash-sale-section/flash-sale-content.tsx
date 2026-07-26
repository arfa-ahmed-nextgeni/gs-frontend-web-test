import { getLocale, getTranslations } from "next-intl/server";

import { FlashSaleCarousel } from "@/components/product/flash-sale-section/flash-sale-carousel";
import { FlashSaleCountdown } from "@/components/product/flash-sale-section/flash-sale-countdown";
import { ContentfulImage } from "@/components/shared/contentful-image";
import { Link } from "@/i18n/navigation";
import { getBulletDeliveryEnabled } from "@/lib/actions/config/get-bullet-delivery-enabled";
import { getProductsByCategory } from "@/lib/actions/products/get-products-by-category";
import { Locale } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import { FlashSale } from "@/lib/models/flash-sale";
import { isOk } from "@/lib/utils/service-result";

import type { ProductCardModel } from "@/lib/models/product-card-model";

export const FlashSaleContent = async ({
  autoSlideDelay,
  autoSliding,
  endTime,
  lpRow,
  maximumProducts,
  productsCategoryId,
  saleIcon,
  showViewAll,
  subtitle,
  title,
  variant,
}: {
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
    <div className="relative lg:mb-28">
      <div
        aria-hidden
        className="bg-bg-success absolute inset-0 rounded-[15px] lg:hidden"
      />
      <div className="bg-bg-success lg:w-274.75 relative w-full rounded-[15px] px-5 pb-0 pt-5 lg:my-8 lg:h-[300px] lg:px-6 lg:pb-32 lg:pt-6">
        {showViewAll && (
          <Link
            className="text-text-tertiary absolute end-4 top-4 hidden text-base font-normal lg:end-8 lg:top-7 lg:block"
            href={ROUTES.CATEGORY.BY_SLUG(productsCategoryId)}
          >
            {t("seeAll")}
          </Link>
        )}

        <div className="flex flex-col">
          <div className="flex-col">
            <div className="flex items-center gap-2.5">
              {saleIcon && (
                <ContentfulImage
                  alt="Flash Sale"
                  className="h-6 w-4 lg:h-9 lg:w-6"
                  height={36}
                  src={
                    saleIcon.startsWith("http") ? saleIcon : `https:${saleIcon}`
                  }
                  width={24}
                />
              )}
              <span className="text-text-brand text-[25px] font-bold lg:text-[51px] lg:rtl:text-[45px]">
                {title}
              </span>
            </div>
            <div className="text-text-primary text-[18px] font-normal lg:w-[320px] lg:text-[28px]">
              {subtitle}
            </div>
          </div>
          <div className="lg:inset-s-6 mt-3 lg:absolute lg:bottom-6 lg:mt-0">
            {endTime && <FlashSaleCountdown endTime={endTime} />}
          </div>
        </div>
      </div>

      <div className="lg:-bottom-22.5 relative -me-2.5 mt-4 min-w-0 lg:absolute lg:end-0 lg:z-10 lg:me-0 lg:mt-0 lg:w-[700px] xl:w-[800px]">
        <div className="w-full">
          <FlashSaleCarousel
            autoSlideDelay={autoSlideDelay ?? 5000}
            autoSliding={autoSliding ?? true}
            isBulletDeliveryEnabled={isBulletDeliveryEnabled}
            lpRow={lpRow}
            products={products}
          />
        </div>
      </div>

      {showViewAll && (
        <Link
          className="text-text-tertiary relative flex justify-end py-4 pe-5 text-[15px] font-normal lg:hidden"
          href={ROUTES.CATEGORY.BY_SLUG(productsCategoryId)}
        >
          {t("seeAll")}
        </Link>
      )}
    </div>
  );
};
