import { cacheTag } from "next/cache";

import { getLocale, getTranslations } from "next-intl/server";

import { SectionHeader } from "@/components/common/section-header";
import { ProductCard } from "@/components/product/product-card";
import {
  ProductCardsScrollSnapCarousel,
  ProductCardsScrollSnapCarouselItem,
} from "@/components/product/product-cards-scroll-snap-carousel";
import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getBulletDeliveryEnabled } from "@/lib/actions/config/get-bullet-delivery-enabled";
import { getDeviceIdCookie } from "@/lib/actions/cookies/device-id";
import { getCustomerByAuthToken } from "@/lib/actions/customer/get-customer-by-auth-token";
import { getViewedProducts } from "@/lib/actions/products/get-viewed-products";
import {
  getRecentlyViewedProductsTagByDeviceId,
  getRecentlyViewedProductsTagByMobileNumber,
} from "@/lib/constants/cache/tags";
import { type Locale } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import { RecentlyViewedProductsContent } from "@/lib/models/recently-viewed-products-content";
import { isOk } from "@/lib/utils/service-result";

import { DeviceIdCookieBootstrap } from "./device-id-cookie-bootstrap";

export async function RecentlyViewedProductsSection({
  data,
  lpRow,
}: {
  data: RecentlyViewedProductsContent;
  lpRow?: number;
}) {
  "use cache: private";

  const authToken = await getAuthToken();
  let cacheIdentityTag: null | string = null;

  if (authToken) {
    const customer = await getCustomerByAuthToken(authToken);
    if (customer?.phoneNumber) {
      cacheIdentityTag = getRecentlyViewedProductsTagByMobileNumber(
        customer.phoneNumber.replace(/\D/g, "")
      );
    }
  } else {
    const deviceId = await getDeviceIdCookie();
    if (!deviceId) {
      return <DeviceIdCookieBootstrap maximumProducts={data.maximumProducts} />;
    }

    cacheIdentityTag = getRecentlyViewedProductsTagByDeviceId(deviceId);
  }

  if (cacheIdentityTag) {
    cacheTag(cacheIdentityTag);
  }

  const locale = (await getLocale()) as Locale;
  const [isBulletDeliveryEnabled, response, t, tCategoryProducts] =
    await Promise.all([
      getBulletDeliveryEnabled({ locale }),
      getViewedProducts(),
      getTranslations("HomePage.recentlyViewedProducts"),
      getTranslations("HomePage.categoryProducts"),
    ]);

  if (!isOk(response)) {
    return null;
  }

  const products = response.data.products.slice(0, data.maximumProducts);

  if (!products.length) {
    return null;
  }

  const seeAllHref =
    data.viewAllUrl ||
    (data.productsCategoryId
      ? ROUTES.CATEGORY.BY_SLUG(data.productsCategoryId)
      : "");

  return (
    <div className="gap-4.5 flex flex-col">
      <SectionHeader
        lpColumn={1}
        lpExtra={{
          type: "recently-viewed-products",
        }}
        lpRow={lpRow}
        richTitle={data.richTitle}
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
          show: data.showViewAll && Boolean(seeAllHref),
          text: tCategoryProducts("seeAll"),
        }}
      />

      <ProductCardsScrollSnapCarousel
        carouselProps={{
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
          <ProductCardsScrollSnapCarouselItem key={`${product.id}-${index}`}>
            <ProductCard
              isBulletDeliveryEnabled={isBulletDeliveryEnabled}
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
          </ProductCardsScrollSnapCarouselItem>
        ))}
      </ProductCardsScrollSnapCarousel>
    </div>
  );
}
