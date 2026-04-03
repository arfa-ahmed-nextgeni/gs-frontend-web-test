import "server-only";

import { cache } from "react";

import { getLocale } from "next-intl/server";

import { graphqlRequest } from "@/lib/clients/graphql";
import { PRODUCTS_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/products";
import { Locale } from "@/lib/constants/i18n";
import {
  PRODUCT_REVIEWS_SORT_CONFIG,
  ProductReviewsSortOption,
} from "@/lib/constants/product/product-reviews/sort-by";
import { ProductReviews } from "@/lib/models/product-reviews";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok } from "@/lib/utils/service-result";

export const getProductReviews = cache(
  async ({
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
