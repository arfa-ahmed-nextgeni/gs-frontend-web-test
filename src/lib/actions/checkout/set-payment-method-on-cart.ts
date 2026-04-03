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

type SetPaymentMethodOnCartResult = {
  cart: {
    prices?: {
      cod_fee?: {
        currency: string;
        value: number;
      };
    };
    selected_payment_method?: {
      code: string;
      title: string;
    };
  };
};

export async function setPaymentMethodOnCartAction({
  paymentMethodCode,
}: {
  paymentMethodCode: string;
}) {
  const tCommonErrors = await getTranslations("CommonErrors");
  try {
    const authToken = await getAuthToken();
    const locale = (await getLocale()) as Locale;
    const cartId = await getCartId();

    if (!cartId) {
      return failure("No active cart found");
    }

    if (!paymentMethodCode) {
      return failure("Payment method code is required");
    }

    console.info(
      "[setPaymentMethodOnCartAction] Setting paymentMethodCode:",
      paymentMethodCode
    );

    const response: any = await graphqlRequest<any, any>({
      authToken,
      query: CART_GRAPHQL_MUTATIONS.SET_PAYMENT_METHOD_ON_CART,
      storeCode: getStoreCode(locale),
      variables: {
        cartId,
        paymentMethod: {
          code: paymentMethodCode,
        },
      } as any,
    });

    console.info(
      "[setPaymentMethodOnCartAction] Full response:",
      JSON.stringify(response, null, 2)
    );

    if (response.errors?.length) {
      const errorMessage =
        response.errors?.[0]?.message || "Failed to set payment method";
      return failure(errorMessage);
    }

    const cart = response.data?.setPaymentMethodOnCart?.cart ?? null;

    console.info("[setPaymentMethodOnCartAction] Cart object:", cart);

    if (!cart) {
      return failure("Failed to set payment method");
    }

    const returnedPaymentMethodCode =
      cart.selected_payment_method?.code ?? null;
    console.info(
      "[setPaymentMethodOnCartAction] Returned paymentMethodCode:",
      returnedPaymentMethodCode
    );

    return ok<SetPaymentMethodOnCartResult>({
      cart,
    });
  } catch (error) {
    console.error("Error setting payment method on cart:", error);
    return failure(
      getCommonErrorMessage({
        error,
        fallbackMessage: "Failed to set payment method",
        tCommonErrors,
      })
    );
  }
}
