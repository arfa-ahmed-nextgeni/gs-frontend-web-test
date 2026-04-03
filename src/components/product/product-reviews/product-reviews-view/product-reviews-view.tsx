import { getTranslations } from "next-intl/server";

import { ProductReviewTracker } from "@/components/analytics/product-review-tracker";
import { AsyncBoundary } from "@/components/common/async-boundary";
import { ProductReviewWriteLink } from "@/components/product/product-reviews/product-review-write-link";
import { ProductReviewsList } from "@/components/product/product-reviews/product-reviews-view/product-reviews-list";
import { ProductReviewsListContainer } from "@/components/product/product-reviews/product-reviews-view/product-reviews-list-container";
import { ProductReviewsListSkeleton } from "@/components/product/product-reviews/product-reviews-view/product-reviews-list-skeleton";
import { ProductReviewsSortByFilter } from "@/components/product/product-reviews/product-reviews-view/product-reviews-sort-by-filter";
import { ProductReviewsSummary } from "@/components/product/product-reviews/product-reviews-view/product-reviews-summary";
import { ProductReviewsSummarySkeleton } from "@/components/product/product-reviews/product-reviews-view/product-reviews-summary-skeleton";
import { getProductDetails } from "@/lib/actions/products/get-product-details";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { cn } from "@/lib/utils";

export const ProductReviewsView = async ({
  params,
  searchParams,
}: {
  params: Promise<{
    productId: string;
    urlKey: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const { productId, urlKey: urlKayParam } = await params;

  const queryParams = await searchParams;

  const urlKey = decodeURIComponent(urlKayParam);
  const currentPage = parseInt(queryParams[QueryParamsKey.Page] as string) || 1;
  const sortBy = (queryParams[QueryParamsKey.Sort] as string) || "";

  const t = await getTranslations("ProductReviewsPage");

  const productDetailsPromise = getProductDetails({ urlKey });

  return (
    <>
      <AsyncBoundary fallback={null}>
        <ProductReviewTracker productDetailsPromise={productDetailsPromise} />
      </AsyncBoundary>
      <ProductReviewsSortByFilter />
      <div className="flex h-full flex-col">
        <ProductReviewsListContainer>
          <AsyncBoundary fallback={<ProductReviewsSummarySkeleton />}>
            <ProductReviewsSummary urlKey={urlKey} />
          </AsyncBoundary>

          <AsyncBoundary
            fallback={<ProductReviewsListSkeleton />}
            key={`${currentPage}-${sortBy}`}
          >
            <ProductReviewsList
              currentPage={currentPage}
              productId={+productId}
              sortBy={sortBy}
            />
          </AsyncBoundary>
        </ProductReviewsListContainer>

        <div className="bg-bg-default border-border-base lg:pb-30 fixed bottom-0 left-0 right-0 flex border-t px-5 py-2.5 lg:static lg:pt-5">
          <ProductReviewWriteLink
            loadingLinkProps={{
              className: cn(
                "transition-default bg-btn-bg-primary h-12.5 flex justify-center items-center text-text-inverse w-full rounded-xl text-xl font-medium",
                "hover:bg-btn-bg-slate",
                "focus:bg-btn-bg-primary focus:outline-none"
              ),
            }}
          >
            {t("writeAReview")}
          </ProductReviewWriteLink>
        </div>
      </div>
    </>
  );
};
