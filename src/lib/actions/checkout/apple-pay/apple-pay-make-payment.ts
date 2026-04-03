"use server";

import { unauthorized } from "next/navigation";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { restRequest } from "@/lib/clients/rest";
import { ORDER_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { Locale } from "@/lib/constants/i18n";
import { PaymentStatus } from "@/lib/constants/payment-status";
import { ROUTES } from "@/lib/constants/routes";
import {
  MakePaymentRequest,
  MakePaymentResponse,
  PayFortApplePayPayResponse,
  PaymentMethodType,
  PaymentPayload,
} from "@/lib/types/payment";
import { ServiceResultOk } from "@/lib/types/service-result";
import { ok } from "@/lib/utils/service-result";

export async function applePayMakePaymentAction({
  baseUrl,
  data,
  locale,
  orderId,
  paymentMethodType,
  token,
}: {
  baseUrl: string;
  data?: PayFortApplePayPayResponse;
  locale: Locale;
  orderId: string;
  paymentMethodType: PaymentMethodType;
  token?: string;
}): Promise<ServiceResultOk<{ checkoutUrl: string }>> {
  const authToken = await getAuthToken();

  if (!authToken) {
    unauthorized();
  }

  const failureRedirectUrl = `${baseUrl}${ROUTES.CHECKOUT.REFILL_CART_API(PaymentStatus.Failed)}`;

  let checkoutUrl = failureRedirectUrl;

  try {
    const storeConfigResult = await getStoreConfig({ locale });
    const storeConfig = storeConfigResult.data;

    const payload = buildPaymentPayload(paymentMethodType, token, data);

    const requestPayload: MakePaymentRequest = {
      orderId,
      payload,
    };

    const response = await restRequest<MakePaymentResponse>({
      endpoint: ORDER_ENDPOINTS.MAKE_PAYMENT,
      options: {
        body: JSON.stringify(requestPayload),
        method: "POST",
      },
      storeCode: storeConfig.store?.code,
    });

    if (response.data.success) {
      checkoutUrl = `${baseUrl}${ROUTES.CHECKOUT.PAYMENT_SUCCESS_API}`;
    }

    return ok({
      checkoutUrl,
    });
  } catch (error) {
    console.error("Error in applePayMakePaymentAction:", error);
    return ok({ checkoutUrl });
  }
}

function buildPaymentPayload(
  paymentMethodType: PaymentMethodType,
  token?: string,
  data?: PayFortApplePayPayResponse
): PaymentPayload {
  switch (paymentMethodType) {
    case "checkoutapplepay": {
      // Backend only needs the Apple Pay token (JSON stringified)
      // Backend will handle token conversion internally
      const normalizedToken = token?.trim();

      if (!normalizedToken) {
        throw new Error("Token is required for Apple Pay payment");
      }

      // Simplified payload - backend has everything else
      return {
        token: normalizedToken,
      };
    }

    case "payfortapplepay": {
      if (!data) {
        throw new Error("Data is required for PayFort Apple Pay payment");
      }

      return data;
    }

    default:
      throw new Error(`Unsupported payment method: ${paymentMethodType}`);
  }
}
