"use server";

import { unauthorized } from "next/navigation";

import { getLocale, getTranslations } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { graphqlRequest } from "@/lib/clients/graphql";
import { PRODUCTS_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/products";
import { Locale } from "@/lib/constants/i18n";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok } from "@/lib/utils/service-result";

export const reportProductReview = async ({
  reviewId,
}: {
  reviewId: number;
}) => {
  const t = await getTranslations("ProductReviewsPage.messages");

  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      unauthorized();
    }

    const locale = (await getLocale()) as Locale;

    const response = await graphqlRequest({
      authToken,
      query: PRODUCTS_GRAPHQL_MUTATIONS.VOTE_PRODUCT_REVIEW,
      storeCode: getStoreCode(locale),
      variables: {
        isHelpful: false,
        reviewId,
      },
    });

    if (
      response.errors?.length ||
      !response.data?.voteReviewHelpful?.review_id
    ) {
      return failure(t("reviewReportFailed"));
    }

    return ok(t("reviewReportSuccess"));
  } catch (error) {
    console.error("Error voting product review:", error);

    return failure(t("reviewReportFailed"));
  }
};
