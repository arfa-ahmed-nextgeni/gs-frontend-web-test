import { Suspense } from "react";

import { connection } from "next/server";

import { ProductReviewForm } from "@/components/product/product-reviews/product-review-form";
import { ProductReviewFormLayout } from "@/components/product/product-reviews/product-review-form/product-review-form-layout";
import { ProductReviewProductInfo } from "@/components/product/product-reviews/product-review-form/product-review-product-info";
import { ProductReviewProductInfoSkeleton } from "@/components/product/product-reviews/product-review-form/product-review-product-info-skeleton";
import { redirect } from "@/i18n/navigation";
import { getProductDetails } from "@/lib/actions/products/get-product-details";
import { buildProductPropertiesFromDetails } from "@/lib/analytics/utils/build-properties";
import { Locale } from "@/lib/constants/i18n";
import { ROUTE_PLACEHOLDER, ROUTES } from "@/lib/constants/routes";
import { initializePageLocale } from "@/lib/utils/locale";
import { isOk } from "@/lib/utils/service-result";

type AddProductReviewPageContentProps = {
  params: Promise<{
    locale: string;
    urlKey: string;
  }>;
};

export async function AddProductReviewPageContent({
  params,
}: AddProductReviewPageContentProps) {
  await connection();

  const { locale, urlKey } = await params;
  const decodedUrlKey = decodeURIComponent(urlKey);

  initializePageLocale(locale);

  if (urlKey === ROUTE_PLACEHOLDER) {
    redirect({
      href: ROUTES.PRODUCT.BY_URL_KEY(decodedUrlKey),
      locale: locale as Locale,
    });
  }

  const productBasicInfoResponse = await getProductDetails({
    locale: locale as Locale,
    urlKey: decodedUrlKey,
  });

  const productProperties =
    isOk(productBasicInfoResponse) && productBasicInfoResponse.data
      ? buildProductPropertiesFromDetails(productBasicInfoResponse.data)
      : undefined;

  return (
    <ProductReviewFormLayout>
      <ProductReviewForm
        product={productProperties}
        sku={productBasicInfoResponse.data?.sku || ""}
      >
        <Suspense fallback={<ProductReviewProductInfoSkeleton />}>
          <ProductReviewProductInfo params={params} />
        </Suspense>
      </ProductReviewForm>
    </ProductReviewFormLayout>
  );
}
