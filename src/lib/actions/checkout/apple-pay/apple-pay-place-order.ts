"use server";

// eslint-disable-next-line no-restricted-imports
import { redirect as nextRedirect, RedirectType } from "next/navigation";

import { getLocale, getTranslations } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { applePayMakePaymentAction } from "@/lib/actions/checkout/apple-pay/apple-pay-make-payment";
import { getPayfortOrderDetailsAction } from "@/lib/actions/checkout/get-payfort-order-details";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { deleteCartId, getCartId } from "@/lib/actions/cookies/cart";
import { setPendingOrderInfo } from "@/lib/actions/cookies/checkout";
import { checkoutRequest } from "@/lib/clients/checkout";
import { graphqlRequest } from "@/lib/clients/graphql";
import { paymentsServiceRequest } from "@/lib/clients/payments-service";
import {
  CHECKOUT_API_ENDPOINTS,
  PAYMENT_ENDPOINTS,
} from "@/lib/constants/api/endpoints";
import { CART_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/cart";
import { Locale } from "@/lib/constants/i18n";
import { PaymentStatus } from "@/lib/constants/payment-status";
import { ROUTES } from "@/lib/constants/routes";
import { CheckoutTokenDto } from "@/lib/types/api/payment-card";
import { PayFortApplePayPayResponse } from "@/lib/types/payment";
import { getCommonErrorMessage } from "@/lib/utils/common-error-message";
import { isPayfortApplePayPaymentMethod } from "@/lib/utils/payment-method";
import { failure, isOk } from "@/lib/utils/service-result";

type ApplePayPaymentData = {
  data: string;
  header: {
    ephemeralPublicKey: string;
    publicKeyHash: string;
    transactionId: string;
  };
  signature: string;
  version: string;
};

export async function applePayPlaceOrderAction({
  applePayPaymentToken,
  baseUrl,
  paymentMethodType,
}: {
  applePayPaymentToken: ApplePayJS.ApplePayPaymentToken;
  baseUrl: string;
  paymentMethodType: string;
}) {
  const authToken = await getAuthToken();
  const cartId = await getCartId();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("CheckoutPage.applePay.errors");
  const tCommonErrors = await getTranslations("CommonErrors");
  const failureRedirectUrl = `${baseUrl}${ROUTES.CHECKOUT.REFILL_CART_API(PaymentStatus.Failed)}`;

  if (!cartId) {
    return failure(t("noActiveCart"));
  }

  const storeConfig = await getStoreConfig({
    locale,
  });

  let orderId: string | undefined;

  try {
    const placeOrderResponse = await graphqlRequest({
      authToken,
      query: CART_GRAPHQL_MUTATIONS.PLACE_ORDER,
      storeCode: storeConfig.data?.store?.code,
      variables: {
        cartId,
      },
    });

    orderId = placeOrderResponse.data?.placeOrder?.orderV2?.number;

    if (placeOrderResponse.errors?.length || !orderId) {
      const errorMessage =
        placeOrderResponse.errors?.[0]?.message || t("failedToPlaceOrder");
      return failure(errorMessage);
    }
  } catch (error) {
    console.error(
      "[applePayPlaceOrderAction] Error place order with Apple Pay:",
      error
    );
    return failure(
      getCommonErrorMessage({
        error,
        fallbackMessage: t("failedToPlaceOrder"),
        tCommonErrors,
      })
    );
  }

  await deleteCartId();
  await setPendingOrderInfo({
    baseUrl,
    locale,
    orderId,
  });

  let checkoutUrl: string | undefined;

  try {
    // Handle PayFort Apple Pay flow
    if (isPayfortApplePayPaymentMethod(paymentMethodType)) {
      // Step 1: Get PayFort order details
      const payfortDetailsResult = await getPayfortOrderDetailsAction({
        locale,
        orderId,
      });

      if (!isOk(payfortDetailsResult)) {
        checkoutUrl = failureRedirectUrl;
        throw new Error("Failed to get PayFort order details");
      }

      const payfortDetails = payfortDetailsResult.data;

      // Step 2: Extract Apple Pay token fields for PayFort API
      const paymentData =
        applePayPaymentToken.paymentData as ApplePayPaymentData;
      const paymentMethod = applePayPaymentToken.paymentMethod;
      const transactionIdentifier = applePayPaymentToken.transactionIdentifier;

      // Build PayFort Apple Pay payload
      const payfortPayload = {
        amount: payfortDetails.amount,
        apple_data: paymentData.data,
        apple_header: {
          apple_ephemeralPublicKey:
            paymentData.header?.ephemeralPublicKey || "",
          apple_publicKeyHash: paymentData.header?.publicKeyHash || "",
          apple_transactionId: transactionIdentifier || "",
        },
        apple_paymentMethod: {
          apple_displayName: paymentMethod?.displayName || "",
          apple_network: paymentMethod?.network || "",
          apple_type: paymentMethod?.type || "",
        },
        apple_signature: paymentData.signature,
        currency: payfortDetails.currency,
        customer_email: payfortDetails.customer_email || "",
        language: payfortDetails.payfortDetail.language,
        merchant_reference: payfortDetails.payfortDetail.merchant_reference,
      };

      // Step 3: Call PayFort Apple Pay API
      const payfortResponse =
        await paymentsServiceRequest<PayFortApplePayPayResponse>({
          authToken: authToken ?? undefined,
          endpoint: PAYMENT_ENDPOINTS.PAYFORT_APPLE_PAY_PAY,
          options: {
            body: JSON.stringify(payfortPayload),
            method: "POST",
          },
        });

      if (
        payfortResponse.status !== 200 ||
        payfortResponse.data?.status_code !== 200 ||
        !payfortResponse.data?.body
      ) {
        checkoutUrl = failureRedirectUrl;
        throw new Error("Failed to process Apple Pay payment with PayFort");
      }

      // Step 4: Call makePaymentAction with PayFort token
      const paymentResult = await applePayMakePaymentAction({
        baseUrl,
        data: payfortResponse.data,
        locale,
        orderId,
        paymentMethodType: "payfortapplepay",
      });

      checkoutUrl = paymentResult.data.checkoutUrl;
    } else {
      // Handle Checkout Apple Pay flow (existing)
      const checkoutTokenResponse = await checkoutRequest<CheckoutTokenDto>({
        endpoint: CHECKOUT_API_ENDPOINTS.TOKENS,
        options: {
          body: JSON.stringify({
            store_view: storeConfig.data?.store?.code,
            token_data: applePayPaymentToken.paymentData,
            type: "applepay",
          }),
          method: "POST",
        },
      });

      if (!checkoutTokenResponse?.data?.token) {
        checkoutUrl = failureRedirectUrl;
        throw new Error("Failed to get checkout token for Apple Pay payment");
      }

      const paymentResult = await applePayMakePaymentAction({
        baseUrl,
        locale,
        orderId,
        paymentMethodType: "checkoutapplepay",
        token: checkoutTokenResponse.data.token,
      });

      checkoutUrl = paymentResult.data.checkoutUrl;
    }
  } catch (error) {
    console.error(
      "[applePayPlaceOrderAction] Error make payment with Apple Pay:",
      error
    );
    checkoutUrl = failureRedirectUrl;
  }

  if (checkoutUrl) {
    nextRedirect(checkoutUrl, RedirectType.replace);
  }

  nextRedirect(failureRedirectUrl, RedirectType.replace);
}
