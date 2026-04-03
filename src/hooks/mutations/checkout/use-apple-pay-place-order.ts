import { useCallback } from "react";

import { isRedirectError } from "next/dist/client/components/redirect-error";

import { useMutation } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";

import { toast } from "@/components/ui/sonner";
import { useApplePayContext } from "@/contexts/apple-pay-context";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { useOrderSummary } from "@/hooks/checkout/use-order-summary";
import { applePayPlaceOrderAction } from "@/lib/actions/checkout/apple-pay/apple-pay-place-order";
import { applePayValidateMerchantAction } from "@/lib/actions/checkout/apple-pay/apple-pay-validate-merchant";
import { trackApplepayClose } from "@/lib/analytics/events";
import { buildOrderProperties } from "@/lib/analytics/utils/build-properties";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import {
  ServiceResultError,
  ServiceResultOk,
} from "@/lib/types/service-result";
import { getApplePayMerchantIdentifier } from "@/lib/utils/checkout/apple-pay";
import { failure, isError, ok } from "@/lib/utils/service-result";

export const useApplePayPlaceOrder = ({
  selectedPayment,
  selectedShippingOption,
}: {
  selectedPayment: string;
  selectedShippingOption: string;
}) => {
  const locale = useLocale() as Locale;
  const t = useTranslations("CheckoutPage.applePay.errors");
  const tApplePay = useTranslations("CheckoutPage.applePay");

  const { cart } = useCart();

  const { isAvailable } = useApplePayContext();

  const { storeConfig } = useStoreConfig();

  const { totalDue: amount } = useOrderSummary();

  const mutationFn = useCallback(async () => {
    return new Promise<
      | ServiceResultError
      | ServiceResultOk<{
          checkoutUrl?: string;
        }>
    >((resolve, reject) => {
      if (!isAvailable) {
        return reject(failure(t("notAvailable")));
      }

      const countryCode = storeConfig?.countryCode || "SA";
      const currencyCode = storeConfig?.currencyCode || "SAR";

      const formattedAmount = amount.toFixed(2);
      const countryCodeUpper = countryCode.toUpperCase();
      const networks: string[] = ["visa", "masterCard"];

      if (
        countryCodeUpper === "SA" ||
        countryCodeUpper === "AE" ||
        countryCodeUpper === "OM" ||
        countryCodeUpper === "KW" ||
        countryCodeUpper === "IQ"
      ) {
        networks.push("mada");
      } else {
        networks.push("amex");
      }

      const merchantIdentifier = getApplePayMerchantIdentifier(selectedPayment);

      const paymentRequest: ApplePayJS.ApplePayPaymentRequest = {
        countryCode,
        currencyCode,
        merchantCapabilities: [
          "supports3DS",
          "supportsCredit",
          "supportsDebit",
          "supportsEMV",
        ],
        supportedNetworks: networks,
        total: {
          amount: formattedAmount,
          label: tApplePay("displayName"),
          type: "final",
        },
      };

      const session = new ApplePaySession(3, paymentRequest);

      session.onvalidatemerchant = async (event) => {
        const merchantSession = await applePayValidateMerchantAction({
          initiativeContext: window.location.hostname,
          merchantIdentifier,
          paymentMethodType: selectedPayment,
          validationURL: event.validationURL,
        });

        if (isError(merchantSession)) {
          session.abort();
          return reject(merchantSession);
        }

        session.completeMerchantValidation(merchantSession.data);
      };

      session.onpaymentauthorized = async (event) => {
        try {
          const applePayPlaceOrderResult = await applePayPlaceOrderAction({
            applePayPaymentToken: event.payment.token,
            baseUrl: window.location.origin,
            paymentMethodType: selectedPayment,
          });

          if (isError(applePayPlaceOrderResult)) {
            session.completePayment({ status: ApplePaySession.STATUS_FAILURE });
            return reject(applePayPlaceOrderResult);
          }
        } catch (error) {
          console.error(
            "[useApplePayPlaceOrder] applePayPlaceOrderAction error: ",
            error
          );
          if (isRedirectError(error)) {
            session.completePayment({ status: ApplePaySession.STATUS_SUCCESS });
            return resolve(ok({}));
          }

          session.completePayment({ status: ApplePaySession.STATUS_FAILURE });
          return reject(error);
        }
      };

      session.oncancel = (event) => {
        // Payment canceled by WebKit
        console.error(
          "[useApplePayPlaceOrder] Payment canceled by WebKit:",
          event
        );

        if (cart) {
          const shippingMethod = selectedShippingOption || "";
          const paymentMethod = selectedPayment || "checkoutapplepay";

          const orderProperties = buildOrderProperties(
            cart,
            paymentMethod,
            shippingMethod
          );

          trackApplepayClose(orderProperties);
        }

        return reject(failure(t("paymentCanceled")));
      };

      session.begin();
    });
  }, [
    amount,
    cart,
    isAvailable,
    selectedPayment,
    selectedShippingOption,
    storeConfig?.countryCode,
    storeConfig?.currencyCode,
    t,
    tApplePay,
  ]);

  return useMutation({
    mutationFn,
    mutationKey: MUTATION_KEYS.CHECKOUT.CHECKOUT_APPLE_PAY({ locale }),

    onError: (error) => {
      console.error(
        "[useApplePayPlaceOrder] Error placing order with Apple Pay:",
        error
      );

      if (isError(error as unknown as ServiceResultError)) {
        toast({
          title: (error as unknown as ServiceResultError).error,
          type: "error",
        });
      } else {
        toast({
          title: t("errorPlacingOrder"),
          type: "error",
        });
      }
    },

    onSuccess: (data) => {
      if (data?.data?.checkoutUrl) {
        location.replace(data?.data?.checkoutUrl);
      }
    },
  });
};
