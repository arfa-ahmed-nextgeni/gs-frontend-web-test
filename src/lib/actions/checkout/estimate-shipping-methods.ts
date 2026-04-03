"use server";

import { getLocale, getTranslations } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getCartId } from "@/lib/actions/cookies/cart";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CART_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/cart";
import { Locale } from "@/lib/constants/i18n";
import { getCommonErrorMessage } from "@/lib/utils/common-error-message";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok } from "@/lib/utils/service-result";

type EstimateShippingMethodsResult = {
  methods: Array<{
    amount: {
      currency: null | string;
      value: null | number;
    } | null;
    available: boolean;
    carrier_code: null | string;
    carrier_title: null | string;
    cutting_time: null | string;
    delivery_time: null | string;
    free_over_cart_value: null | number;
    method_code: null | string;
    method_title: null | string;
    shipping_days_max: null | number;
    shipping_days_min: null | number;
    shipping_fee: null | number;
    shipping_method_title: null | string;
    shipping_time: null | string;
    start_hour: null | string;
  }>;
};

export async function estimateShippingMethodsAction({
  countryCode,
}: {
  countryCode: string;
}) {
  const tCommonErrors = await getTranslations("CommonErrors");
  try {
    const authToken = await getAuthToken();
    const locale = (await getLocale()) as Locale;
    const cartId = await getCartId();

    if (!cartId) {
      return failure("No active cart found");
    }

    if (!countryCode) {
      return failure("Country code is required");
    }

    const response: any = await graphqlRequest<any, any>({
      authToken,
      query: CART_GRAPHQL_MUTATIONS.ESTIMATE_SHIPPING_METHODS,
      storeCode: getStoreCode(locale),
      variables: {
        cartId,
        countryCode,
      } as any,
    });

    if (response.errors?.length) {
      const errorMessage =
        response.errors?.[0]?.message || "Failed to estimate shipping methods";
      return failure(errorMessage);
    }

    const methods =
      response.data?.estimateShippingMethods?.filter(
        (method: any) => method?.available === true
      ) ?? [];

    return ok<EstimateShippingMethodsResult>({ methods });
  } catch (error) {
    console.error("Error estimating shipping methods:", error);
    return failure(
      getCommonErrorMessage({
        error,
        fallbackMessage: "Failed to estimate shipping methods",
        tCommonErrors,
      })
    );
  }
}
