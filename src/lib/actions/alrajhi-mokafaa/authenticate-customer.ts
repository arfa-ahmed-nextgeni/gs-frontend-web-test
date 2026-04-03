"use server";

import { getLocale } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { graphqlRequest } from "@/lib/clients/graphql";
import { ALRAJHI_MOKAFAA_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/alrajhi-mokafaa";
import { Locale } from "@/lib/constants/i18n";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok } from "@/lib/utils/service-result";

/**
 * Authenticate Mokafaa Customer via Mobile Number
 */
export const authenticateMokafaaCustomer = async ({
  cartId,
  mobileNumber,
}: {
  cartId: string;
  mobileNumber: string;
}) => {
  try {
    const authToken = await getAuthToken();

    const locale = (await getLocale()) as Locale;
    const storeCode = getStoreCode(locale);

    const response = await graphqlRequest({
      authToken,
      query: ALRAJHI_MOKAFAA_GRAPHQL_MUTATIONS.AUTHENTICATE_CUSTOMER,
      storeCode,
      variables: { cartId, mobileNumber },
    });
    const data = response?.data?.authenticateMokafaaCustomer;

    if (!data || data.error_code) {
      const msg = data?.message || "";
      return failure(msg);
    }

    // Success
    return ok({
      currency: data.body?.otp?.currency,
      expiresInMin: data.body?.otp?.otp_token_expired_in_min,
      message: data.message,
      otpToken: data.body?.otp?.otp_token,
      statusCode: data.status_code,
    });
  } catch (err) {
    console.error("Mokafaa Auth Error:", err);
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Failed to authenticate Mokafaa customer";
    return failure(errorMessage);
  }
};
