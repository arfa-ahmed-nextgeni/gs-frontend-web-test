"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";

import { ProductReviewCard } from "@/components/product/product-reviews/product-review-card";
import { ProductReviewsListSkeleton } from "@/components/product/product-reviews/product-reviews-view/product-reviews-list-skeleton";
import { PaginationWithSearchParams } from "@/components/shared/pagination-with-search-params";
import { useProductReviewsQuery } from "@/hooks/queries/use-product-reviews-query";
import { usePageQuery } from "@/hooks/use-page-query";
import { PRODUCT_REVIEWS_SORT_OPTIONS } from "@/lib/constants/product/product-reviews/sort-by";
import { QueryParamsKey } from "@/lib/constants/query-params";

import type { ProductReviewsQueryData } from "@/hooks/queries/use-product-reviews-query";

const drawerQueryOptions = {
  history: "replace" as const,
  scroll: false,
  shallow: true,
};

export const ProductReviewsClientList = ({
  initialData,
  initialPage,
  initialSortBy,
  pageSize,
  productId,
}: {
  initialData: ProductReviewsQueryData;
  initialPage: number;
  initialSortBy?: string;
  pageSize: number;
  productId: number;
}) => {
  const { currentPage } = usePageQuery(drawerQueryOptions);
  const [sortBy] = useQueryState(
    QueryParamsKey.Sort,
    parseAsStringLiteral(PRODUCT_REVIEWS_SORT_OPTIONS).withOptions(
      drawerQueryOptions
    )
  );

  const normalizedInitialSortBy = initialSortBy || undefined;
  const normalizedSortBy = sortBy || undefined;

  const { data, isPending } = useProductReviewsQuery({
    initialData,
    page: currentPage,
    pageSize,
    productId,
    sortBy: normalizedSortBy,
    useInitialData:
      currentPage === initialPage &&
      normalizedSortBy === normalizedInitialSortBy,
  });

  if (!data && isPending) {
    return <ProductReviewsListSkeleton />;
  }

  if (!data) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col gap-2.5 px-5">
        {data.reviews.map((review) => (
          <ProductReviewCard
            author={review.author}
            containerProps={{
              className: "w-full",
            }}
            date={review.date}
            key={`review-${review.id}`}
            message={review.message}
            productId={productId}
            rating={review.rating}
            reviewId={review.id}
          />
        ))}
      </div>

      {data.totalPages > 1 && (
        <PaginationWithSearchParams
          maxVisiblePages={5}
          paginationContentProps={{
            className: "lg:gap-1",
          }}
          queryOptions={drawerQueryOptions}
          totalPages={data.totalPages}
        />
      )}
    </>
  );
};
