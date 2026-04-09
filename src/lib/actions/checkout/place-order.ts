"use server";

// eslint-disable-next-line no-restricted-imports
import { redirect as nextRedirect, RedirectType } from "next/navigation";

import { getLocale, getTranslations } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { estimateShippingMethodsAction } from "@/lib/actions/checkout/estimate-shipping-methods";
import { makePaymentAction } from "@/lib/actions/checkout/make-payment";
import { payfortPaymentAction } from "@/lib/actions/checkout/payfort-payment";
import { validateCartForPlaceOrder } from "@/lib/actions/checkout/validate-cart-for-place-order";
import { deleteCartId, getCartId } from "@/lib/actions/cookies/cart";
import { setPendingOrderInfo } from "@/lib/actions/cookies/checkout";
import { updatePaymentCardCheckoutPaymentId } from "@/lib/actions/customer/update-payment-card-checkout-payment-id";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CART_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/cart";
import { Locale } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import {
  isBulletDeliveryMethod,
  isLockerMethod,
} from "@/lib/utils/checkout/shipping-type";
import { getCommonErrorMessage } from "@/lib/utils/common-error-message";
import { getStoreCode } from "@/lib/utils/country";
import { failure, isOk } from "@/lib/utils/service-result";

import type { PlaceOrderOutput } from "@/graphql/graphql";

export type PlaceOrderResult = {
  checkoutUrl?: string;
  errors?: PlaceOrderOutput["errors"];
  orderId?: string;
  orderV2?: PlaceOrderOutput["orderV2"];
  payfortOrder?: boolean;
};

export async function placeOrderAction({
  baseUrl,
  bulletDeliveryUnavailableError,
  customerEmail,
  payfortCardNumber,
  payfortCvv,
  paymentToken,
  savedCardCvv,
  selectedPaymentCard,
}: {
  baseUrl: string;
  bulletDeliveryUnavailableError: string;
  customerEmail?: string;
  payfortCardNumber?: string;
  payfortCvv?: string;
  paymentToken?: string;
  savedCardCvv?: null | string;
  selectedPaymentCard?: {
    checkoutPaymentId?: null | string;
    expiry?: string;
    id: string;
    sourceId: string;
  } | null;
}) {
  const tCommonErrors = await getTranslations("CommonErrors");
  const tCheckoutErrors = await getTranslations("CheckoutPage.errors");
  let checkoutUrl: string | undefined;
  const locale = (await getLocale()) as Locale;
  let orderV2: null | PlaceOrderOutput["orderV2"] | undefined;
  let paymentMethodType: null | string = null;

  const successRedirectUrl = `${baseUrl}${ROUTES.CHECKOUT.PAYMENT_SUCCESS_API}`;

  try {
    const authToken = await getAuthToken();
    const cartId = await getCartId();

    const cartValidationResult = await validateCartForPlaceOrder({
      authToken,
      cartId,
      fallbackErrorMessage: tCheckoutErrors("invalidCart"),
      locale,
    });

    if ("error" in cartValidationResult) {
      return cartValidationResult;
    }

    const cart = cartValidationResult.cart;

    const shippingAddresses = cart.shipping_addresses ?? [];
    if (shippingAddresses.length === 0) {
      return failure("Please select a shipping address");
    }

    const shippingAddress = shippingAddresses[0];
    const selectedShippingMethod = shippingAddress?.selected_shipping_method;
    const availableShippingMethods =
      shippingAddress?.available_shipping_methods ?? [];
    const countryCode = shippingAddress?.country?.code;

    const hasSelectedShippingMethod =
      selectedShippingMethod?.carrier_code &&
      selectedShippingMethod?.method_code;

    if (!hasSelectedShippingMethod) {
      return failure("Please select a delivery method");
    }

    if (!cart.selected_payment_method?.code) {
      return failure("Please select a payment method");
    }

    // Validate shipping methods before placing order
    const carrierCode = selectedShippingMethod.carrier_code;
    const methodCode = selectedShippingMethod.method_code;

    // Validate bullet delivery method availability
    const isSelectedBulletDelivery = isBulletDeliveryMethod(
      carrierCode,
      methodCode
    );

    if (isSelectedBulletDelivery) {
      const isSelectedMethodInAvailableMethods = availableShippingMethods.some(
        (method) =>
          method?.carrier_code === carrierCode &&
          method?.method_code === methodCode
      );

      if (!isSelectedMethodInAvailableMethods) {
        return failure(bulletDeliveryUnavailableError);
      }
    }

    // Check if the selected method is a locker method
    const isLockerMethodSelected = isLockerMethod(carrierCode, methodCode);

    if (isLockerMethodSelected && countryCode) {
      // Verify the locker method is still available
      const estimateResult = await estimateShippingMethodsAction({
        countryCode,
      });

      if (isOk(estimateResult)) {
        const availableMethods = estimateResult.data?.methods ?? [];
        const isMethodAvailable = availableMethods.some(
          (method) =>
            method.carrier_code === carrierCode &&
            method.method_code === methodCode &&
            method.available === true
        );

        if (!isMethodAvailable) {
          const t = await getTranslations("CheckoutPage.errors");
          return failure(t("lockerMethodUnavailable"));
        }
      }
    }

    const response = await graphqlRequest({
      authToken,
      query: CART_GRAPHQL_MUTATIONS.PLACE_ORDER,
      storeCode: getStoreCode(locale),
      variables: {
        cartId: cartId as string,
      },
    });

    if (response.errors?.length) {
      const errorMessage =
        response.errors?.[0]?.message || "Failed to place order";
      return failure(errorMessage);
    }

    const placeOrderPayload = response.data?.placeOrder ?? null;

    if (!placeOrderPayload) {
      return failure("Failed to place order");
    }

    const { errors } = placeOrderPayload;
    orderV2 = placeOrderPayload.orderV2 as
      | null
      | PlaceOrderOutput["orderV2"]
      | undefined;

    if ((!orderV2 || !orderV2?.number) && errors?.length) {
      const firstError = errors.find((error: any) => error?.message)?.message;

      return failure(firstError || "Failed to place order");
    }

    const paymentMethods = orderV2?.payment_methods ?? [];
    paymentMethodType = paymentMethods[0]?.type?.toLowerCase() ?? null;

    const paymentMethodsRequiringInitiation = [
      "checkoutcom_pay",
      "pay_by_instalments",
      "payfortcc",
      "tabby_installments",
      "checkoutapplepay",
    ];

    if (
      paymentMethodType &&
      paymentMethodsRequiringInitiation.includes(paymentMethodType) &&
      orderV2?.number
    ) {
      const cardId =
        paymentMethodType === "checkoutcom_pay" &&
        selectedPaymentCard &&
        selectedPaymentCard.sourceId &&
        selectedPaymentCard.sourceId.trim()
          ? selectedPaymentCard.sourceId.trim()
          : undefined;
      const cvv =
        paymentMethodType === "checkoutcom_pay" &&
        savedCardCvv &&
        savedCardCvv.trim()
          ? savedCardCvv.trim()
          : undefined;
      const token =
        (paymentMethodType === "checkoutcom_pay" ||
          paymentMethodType === "checkoutapplepay") &&
        paymentToken &&
        paymentToken.trim()
          ? paymentToken.trim()
          : undefined;

      if (paymentMethodType === "checkoutcom_pay" && cvv && !cardId) {
        return failure(
          "Payment card source ID is missing. Please select a payment card again."
        );
      }

      if (paymentMethodType === "payfortcc") {
        const payfortPaymentResult = await payfortPaymentAction({
          baseUrl,
          customerEmail,
          locale,
          orderId: orderV2.number,
          payfortCardNumber,
          payfortCvv,
          selectedPaymentCard,
        });

        if (payfortPaymentResult.data?.checkoutUrl) {
          checkoutUrl = payfortPaymentResult.data?.checkoutUrl;
          throw new Error("NEXT_REDIRECT");
        }
      }

      const checkoutPaymentId =
        paymentMethodType === "checkoutcom_pay" &&
        selectedPaymentCard?.checkoutPaymentId &&
        selectedPaymentCard.checkoutPaymentId.trim().length > 0
          ? selectedPaymentCard.checkoutPaymentId.trim()
          : undefined;

      const paymentResult = await makePaymentAction({
        baseUrl,
        cardId,
        checkoutPaymentId,
        cvv,
        locale,
        orderId: orderV2.number,
        paymentMethodType: paymentMethodType as
          | "checkoutapplepay"
          | "checkoutcom_pay"
          | "pay_by_instalments"
          | "payfortcc"
          | "tabby_installments",
        token,
      });

      if (isOk(paymentResult)) {
        checkoutUrl = paymentResult.data?.checkoutUrl;
        const checkoutPaymentId = paymentResult.data?.checkoutPaymentId;

        // Update payment card with checkout_payment_id when payment succeeds for checkout.com cards
        if (
          checkoutPaymentId &&
          paymentMethodType === "checkoutcom_pay" &&
          selectedPaymentCard?.sourceId
        ) {
          try {
            await updatePaymentCardCheckoutPaymentId({
              checkoutPaymentId,
              checkoutSrcId: selectedPaymentCard.sourceId,
            });
            console.info(
              "[placeOrderAction] Updated payment card with checkout_payment_id:",
              checkoutPaymentId
            );
          } catch (error) {
            // Log error but don't fail the order - payment already succeeded
            console.error(
              "[placeOrderAction] Failed to update payment card checkout_payment_id:",
              error
            );
          }
        }

        // Set cookie to track that we're redirecting to payment gateway
        // This allows proxy middleware to detect browser back navigation
        if (checkoutUrl && orderV2?.number) {
          await deleteCartId();
          await setPendingOrderInfo({
            baseUrl,
            locale,
            orderId: orderV2.number,
          });
        }
      }
    } else if (orderV2?.number) {
      // for any other payment method, which doesn't require initiation, redirect to success page
      await deleteCartId();
      await setPendingOrderInfo({
        baseUrl,
        locale,
        orderId: orderV2.number,
      });
      checkoutUrl = successRedirectUrl;
    } else {
      return failure("Failed to place order");
    }
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      // do nothing
    } else {
      return failure(
        getCommonErrorMessage({
          error,
          fallbackMessage: "Failed to place order",
          tCommonErrors,
        })
      );
    }
  }

  if (orderV2?.number) {
    await deleteCartId();
    await setPendingOrderInfo({
      baseUrl,
      locale,
      orderId: orderV2.number,
    });
  }

  if (checkoutUrl) {
    nextRedirect(checkoutUrl, RedirectType.replace);
  }

  nextRedirect(successRedirectUrl, RedirectType.replace);
}
