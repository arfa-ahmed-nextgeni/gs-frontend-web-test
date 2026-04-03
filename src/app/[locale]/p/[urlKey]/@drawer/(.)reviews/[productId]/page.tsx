import { Suspense } from "react";

import { ProductReviewsDrawerLayout } from "@/components/product/product-reviews/product-reviews-view/product-reviews-drawer-layout";
import { ProductReviewsView } from "@/components/product/product-reviews/product-reviews-view/product-reviews-view";
import { ProductReviewsViewSkeleton } from "@/components/product/product-reviews/product-reviews-view/product-reviews-view-skeleton";
import { redirect } from "@/i18n/navigation";
import { Locale } from "@/lib/constants/i18n";
import { ROUTE_PLACEHOLDER, ROUTES } from "@/lib/constants/routes";
import { initializePageLocale } from "@/lib/utils/locale";

export function generateStaticParams() {
  return [{ productId: ROUTE_PLACEHOLDER, urlKey: ROUTE_PLACEHOLDER }];
}

export default async function ProductReviewsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/p/[urlKey]/reviews/[productId]">) {
  const { locale, productId, urlKey } = await params;

  initializePageLocale(locale);

  if (productId === ROUTE_PLACEHOLDER || urlKey === ROUTE_PLACEHOLDER) {
    redirect({
      href: ROUTES.PRODUCT.BY_URL_KEY(decodeURIComponent(urlKey)),
      locale: locale as Locale,
    });
  }

  return (
    <ProductReviewsDrawerLayout>
      <Suspense fallback={<ProductReviewsViewSkeleton />}>
        <ProductReviewsView params={params} searchParams={searchParams} />
      </Suspense>
    </ProductReviewsDrawerLayout>
  );
}
