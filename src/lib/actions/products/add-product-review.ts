"use server";

import { unauthorized } from "next/navigation";

import { getLocale, getTranslations } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getProductReviewRatingsMetadata } from "@/lib/actions/products/get-product-review-ratings-metadata";
import { graphqlRequest } from "@/lib/clients/graphql";
import { PRODUCTS_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/products";
import { Locale } from "@/lib/constants/i18n";
import { getStoreCode } from "@/lib/utils/country";
import { failure, isOk, ok } from "@/lib/utils/service-result";

export const addProductReview = async (data: {
  nickname: string;
  rating: number;
  sku: string;
  text: string;
  title: string;
}) => {
  const t = await getTranslations("AddProductReviewPage.messages");

  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      unauthorized();
    }

    const locale = (await getLocale()) as Locale;

    const metadataResponse = await getProductReviewRatingsMetadata();

    if (!isOk(metadataResponse)) {
      return failure("Unable to fetch review ratings metadata");
    }

    const quality = metadataResponse.data.ratings.get("Quality");
    if (!quality) return failure("Quality rating metadata not found");

    const ratingValueId = quality.values.get(`${data.rating}`);
    if (!ratingValueId)
      return failure(
        `Rating value ${data.rating} not found in Quality metadata`
      );

    const input = {
      nickname: data.nickname,
      ratings: [
        {
          id: quality.id,
          value_id: ratingValueId,
        },
      ],
      sku: data.sku,
      summary: data.title,
      text: data.text,
    };

    const response = await graphqlRequest({
      authToken,
      query: PRODUCTS_GRAPHQL_MUTATIONS.ADD_PRODUCT_REVIEW,
      storeCode: getStoreCode(locale),
      variables: {
        input,
      },
    });

    if (
      response.errors?.length ||
      !response.data?.createProductReview.review.created_at
    ) {
      return failure(t("reviewAddFailed"));
    }

    return ok(t("reviewAddSuccess"));
  } catch (error) {
    console.error("Error adding product review:", error);

    return failure(t("reviewAddFailed"));
  }
};
