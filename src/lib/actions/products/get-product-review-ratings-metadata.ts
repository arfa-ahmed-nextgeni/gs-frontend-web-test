import "server-only";

import { cache } from "react";

import { getLocale } from "next-intl/server";

import { graphqlRequest } from "@/lib/clients/graphql";
import { PRODUCTS_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/products";
import { Locale } from "@/lib/constants/i18n";
import { ReviewRatingsMetadata } from "@/lib/models/review-ratings-metadata";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok } from "@/lib/utils/service-result";

export const getProductReviewRatingsMetadata = cache(async () => {
  try {
    const locale = (await getLocale()) as Locale;

    const response = await graphqlRequest({
      query: PRODUCTS_GRAPHQL_QUERIES.GET_PRODUCT_REVIEW_RATINGS_METADATA,
      storeCode: getStoreCode(locale),
    });

    if (!response.data?.productReviewRatingsMetadata.items.length) {
      return failure("Failed to getProductReviewRatingsMetadata");
    }

    return ok(new ReviewRatingsMetadata(response.data));
  } catch (error) {
    console.error("Failed to getProductReviewRatingsMetadata:", error);
    return failure("Failed to getProductReviewRatingsMetadata");
  }
});
