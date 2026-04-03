"use server";

import { getTranslations } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { setCartId } from "@/lib/actions/cookies/cart";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CUSTOMER_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/customer";
import { Locale } from "@/lib/constants/i18n";
import { getCommonErrorMessage } from "@/lib/utils/common-error-message";
import { failure, ok, unauthenticated } from "@/lib/utils/service-result";

export async function refillCartAction(orderId: string, locale: Locale) {
  const tCommonErrors = await getTranslations("CommonErrors");
  const authToken = await getAuthToken();

  if (!authToken) {
    return unauthenticated();
  }

  try {
    const storeConfigResult = await getStoreConfig({ locale });

    const response = await graphqlRequest({
      authToken,
      query: CUSTOMER_GRAPHQL_MUTATIONS.REORDER_CUSTOMER_ORDER,
      storeCode: storeConfigResult.data?.store?.code,
      variables: {
        increment_id: orderId,
        reorder: false,
      },
    });

    if (response.errors) {
      return failure(response.errors[0]?.message || "Failed to refill cart");
    }

    if (!response.data?.gsRefillCart) {
      return failure("Failed to refill cart");
    }

    const result = response.data.gsRefillCart;

    if (result.success && result.cart_id) {
      await setCartId(result.cart_id);

      return ok({
        cart_id: result.cart_id,
        message: result.message,
      });
    } else {
      return failure(result.message || "Failed to refill cart");
    }
  } catch (error) {
    console.error("Error refilling cart:", error);
    return failure(
      getCommonErrorMessage({
        error,
        fallbackMessage: "Failed to refill cart",
        tCommonErrors,
      })
    );
  }
}
