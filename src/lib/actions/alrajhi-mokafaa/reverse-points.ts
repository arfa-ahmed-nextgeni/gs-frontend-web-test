"use server";

import { getLocale } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { graphqlRequest } from "@/lib/clients/graphql";
import { ALRAJHI_MOKAFAA_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/alrajhi-mokafaa";
import { Locale } from "@/lib/constants/i18n";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok } from "@/lib/utils/service-result";

/**
 * Reverse Mokafaa Points Redemption
 */
export const reverseMokafaaPoints = async (cartId: string) => {
  try {
    const authToken = await getAuthToken();

    const locale = (await getLocale()) as Locale;
    const storeCode = getStoreCode(locale);

    const response = await graphqlRequest({
      authToken,
      query: ALRAJHI_MOKAFAA_GRAPHQL_MUTATIONS.REVERSE_POINTS,
      storeCode,
      variables: { cartId },
    });

    const data = response?.data?.reverseMokafaaPoints;

    if (!data || data.status_code !== "200") {
      const msg = data?.message || "";
      return failure(msg);
    }

    return ok({
      message: data.message,
      requestId: data.body?.request_id,
      statusCode: data.status_code,
    });
  } catch (err) {
    console.error("Mokafaa Reverse Error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to reverse Mokafaa points";
    return failure(errorMessage);
  }
};
