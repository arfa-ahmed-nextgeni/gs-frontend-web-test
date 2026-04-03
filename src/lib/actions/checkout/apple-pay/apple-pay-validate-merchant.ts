"use server";

import { getTranslations } from "next-intl/server";

import { paymentsServiceRequest } from "@/lib/clients/payments-service";
import { PAYMENT_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { isPayfortApplePayPaymentMethod } from "@/lib/utils/payment-method";
import { failure, ok } from "@/lib/utils/service-result";

type ApplePayValidateMerchantResponse = {
  body: {
    displayName: string;
    domainName: string;
    epochTimestamp: number;
    expiresAt: number;
    merchantIdentifier: string;
    merchantSessionIdentifier: string;
    nonce: string;
    operationalAnalyticsIdentifier: string;
    pspId: string;
    retries: number;
    signature: string;
  };
  errors: Record<string, string[]>;
  exception: any[];
  message: string;
  status_code: number;
};

export async function applePayValidateMerchantAction({
  initiativeContext,
  merchantIdentifier,
  paymentMethodType,
  validationURL,
}: {
  initiativeContext: string;
  merchantIdentifier: string;
  paymentMethodType: string;
  validationURL: string;
}) {
  const t = await getTranslations("CheckoutPage.applePay.errors");
  const tApplePay = await getTranslations("CheckoutPage.applePay");

  // Determine the correct endpoint based on payment method type
  const endpoint = isPayfortApplePayPaymentMethod(paymentMethodType)
    ? PAYMENT_ENDPOINTS.PAYFORT_APPLE_PAY_VALIDATE_MERCHANT
    : PAYMENT_ENDPOINTS.APPLE_PAY_VALIDATE_MERCHANT;

  try {
    const response =
      await paymentsServiceRequest<ApplePayValidateMerchantResponse>({
        endpoint,
        options: {
          body: JSON.stringify({
            displayName: tApplePay("displayName"),
            initiative: "web",
            initiativeContext,
            merchantIdentifier,
            validation_url: validationURL,
          }),
          method: "POST",
        },
      });

    if (response.data.status_code !== 200) {
      return failure(response.data.message || t("failedToValidateMerchant"));
    }

    return ok(response.data.body);
  } catch (error) {
    console.error("Error validating Apple Pay merchant:", error);
    return failure(
      error instanceof Error
        ? JSON.stringify(error)
        : t("failedToValidateMerchant")
    );
  }
}
