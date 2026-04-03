import { ProductReviewCard } from "@/components/product/product-reviews/product-review-card";
import { PaginationWithSearchParams } from "@/components/shared/pagination-with-search-params";
import { getProductReviews } from "@/lib/actions/products/get-product-reviews";
import { isOk } from "@/lib/utils/service-result";

export const ProductReviewsList = async ({
  currentPage,
  productId,
  sortBy,
}: {
  currentPage: number;
  productId: number;
  sortBy?: string;
}) => {
  const productReviewsResponse = await getProductReviews({
    page: currentPage,
    pageSize: 10,
    productId,
    sortBy,
  });

  if (isOk(productReviewsResponse)) {
    const { reviews, totalPages } = productReviewsResponse.data;

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
