import "server-only";

import { cache } from "react";

import { getLocale } from "next-intl/server";

import { graphqlRequest } from "@/lib/clients/graphql";
import { PRODUCTS_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/products";
import { PRODUCT_REVIEWS_SORT_CONFIG } from "@/lib/constants/product/product-reviews/sort-by";
import { ProductReviews } from "@/lib/models/product-reviews";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok } from "@/lib/utils/service-result";

import type { Locale } from "@/lib/constants/i18n";
import type { ProductReviewsSortOption } from "@/lib/constants/product/product-reviews/sort-by";

export const getProductReviews = async ({
  page,
  pageSize,
  productId,
  sortBy,
}: {
  page: number;
  pageSize: number;
  productId: number;
  sortBy?: string;
}) => {
  try {
    const locale = (await getLocale()) as Locale;

    return getProductReviewsCached(locale, page, pageSize, productId, sortBy);
  } catch (error) {
    console.error("Failed to get product reviews:", error);
    return failure("Failed to get product reviews");
  }
};

const getProductReviewsCached = cache(
  async (
    locale: Locale,
    page: number,
    pageSize: number,
    productId: number,
    sortBy?: string
  ) => {
    try {
      const sortConfig = sortBy
        ? PRODUCT_REVIEWS_SORT_CONFIG[sortBy as ProductReviewsSortOption]
        : undefined;

      const response = await graphqlRequest({
        query: PRODUCTS_GRAPHQL_QUERIES.GET_PRODUCT_REVIEWS,
        requestInit: {
          cache: "no-store",
        },
        storeCode: getStoreCode(locale),
        variables: {
          page,
          pageSize,
          productId,
          sort: sortConfig,
        },
      });

      if (!response.data?.productReviews?.items?.length) {
        return failure("Failed to get product reviews");
      }

      return ok(new ProductReviews(response.data, pageSize));
    } catch (error) {
      console.error("Failed to get product reviews:", error);
      return failure("Failed to get product reviews");
    }
  }
);
