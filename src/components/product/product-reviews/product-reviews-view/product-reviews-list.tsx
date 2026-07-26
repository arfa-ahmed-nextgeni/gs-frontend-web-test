import { ProductReviewCard } from "@/components/product/product-reviews/product-review-card";
import { ProductReviewsClientList } from "@/components/product/product-reviews/product-reviews-view/product-reviews-client-list";
import { PaginationWithSearchParams } from "@/components/shared/pagination-with-search-params";
import { getProductReviews } from "@/lib/actions/products/get-product-reviews";
import { isOk } from "@/lib/utils/service-result";

const PRODUCT_REVIEWS_PAGE_SIZE = 10;

export const ProductReviewsList = async ({
  clientPagination,
  currentPage,
  productId,
  sortBy,
}: {
  clientPagination?: boolean;
  currentPage: number;
  productId: number;
  sortBy?: string;
}) => {
  const productReviewsResponse = await getProductReviews({
    page: currentPage,
    pageSize: PRODUCT_REVIEWS_PAGE_SIZE,
    productId,
    sortBy,
  });

  if (isOk(productReviewsResponse)) {
    const { reviews, totalPages } = productReviewsResponse.data;

    if (clientPagination) {
      return (
        <ProductReviewsClientList
          initialData={{
            reviews: reviews.map((review) => ({
              author: review.author,
              date: review.date,
              id: review.id,
              message: review.message,
              rating: review.rating,
            })),
            totalPages,
          }}
          initialPage={currentPage}
          initialSortBy={sortBy}
          pageSize={PRODUCT_REVIEWS_PAGE_SIZE}
          productId={productId}
        />
      );
    }

    return (
      <>
        <div className="flex flex-col gap-2.5 px-5">
          {reviews.map((review) => (
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

        {totalPages > 1 && (
          <PaginationWithSearchParams
            maxVisiblePages={5}
            mobileScroll
            paginationContentProps={{
              className: "lg:gap-1",
            }}
            queryOptions={{
              scroll: false,
            }}
            totalPages={totalPages}
          />
        )}
      </>
    );
  }

  return null;
};
