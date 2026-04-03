"use server";

import { getLocale } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { graphqlRequest } from "@/lib/clients/graphql";
import { ALRAJHI_MOKAFAA_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/alrajhi-mokafaa";
import { Locale } from "@/lib/constants/i18n";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok } from "@/lib/utils/service-result";

/**
 * Redeem Mokafaa Points
 */
export const redeemMokafaaPoints = async ({
  amount,
  cartId,
  otpToken,
  otpValue,
}: {
  amount: number;
  cartId: string;
  otpToken: string;
  otpValue: string;
}) => {
  try {
    const authToken = await getAuthToken();

    const locale = (await getLocale()) as Locale;
    const storeCode = getStoreCode(locale);

    const response = await graphqlRequest({
      authToken,
      query: ALRAJHI_MOKAFAA_GRAPHQL_MUTATIONS.REDEEM_POINTS,
      storeCode,
      variables: { amount, cartId, otpToken, otpValue },
    });

    const data = response?.data?.redeemMokafaaPoints;

    if (!data || data.error_code) {
      const msg = data?.message || "";
      return failure(msg);
    }

    return ok({
      discountAmount: data.body?.discount_amount,
      merchant: data.body?.merchant,
      message: data.message,
      pointsAmount: data.body?.points_amount,
      requestId: data.body?.request_id,
      statusCode: data.status_code,
      transactionDate: data.body?.transaction_date,
      transactionId: data.body?.transaction_id,
      transactionType: data.body?.transaction_type,
    });
  } catch (err) {
    console.error("Mokafaa Redeem Error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to redeem Mokafaa points";
    return failure(errorMessage);
  }
};
