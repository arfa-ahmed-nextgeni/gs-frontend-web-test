"use server";

import { unauthorized } from "next/navigation";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { restRequest } from "@/lib/clients/rest";
import { ORDER_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { Locale } from "@/lib/constants/i18n";
import { PaymentStatus } from "@/lib/constants/payment-status";
import { ROUTES } from "@/lib/constants/routes";
import { ServiceResultOk } from "@/lib/types/service-result";
import { ok } from "@/lib/utils/service-result";

import type {
  MakePaymentRequest,
  MakePaymentResponse,
  PaymentMethodType,
  PaymentPayload,
} from "@/lib/types/payment";

type PaymentGatewayData = {
  body?: {
    _links?: {
      redirect?: {
        href?: null | string;
      };
    };
    approved?: boolean;
    id?: string;
    reference?: string;
    response_code?: string;
    response_summary?: string;
    status?: string;
  };
  checkout_id?: string;
  checkout_url?: string;
  configuration?: {
    available_products?: {
      installments?: Array<{
        web_url?: string;
      }>;
    };
  };
  instalments?: string;
  message?: string;
  order_id?: string;
  status?: string;
  status_code?: number;
};

export async function makePaymentAction({
  baseUrl,
  cardId,
  checkoutPaymentId,
  cvv,
  locale,
  orderId,
  paymentMethodType,
  token,
}: {
  baseUrl: string;
  cardId?: string;
  checkoutPaymentId?: string;
  cvv?: string;
  locale: Locale;
  orderId: string;
  paymentMethodType: PaymentMethodType;
  token?: string;
}): Promise<
  ServiceResultOk<{ checkoutPaymentId?: string; checkoutUrl: string }>
> {
  const authToken = await getAuthToken();

  if (!authToken) {
    unauthorized();
  }

  const failureRedirectUrl = `${baseUrl}${ROUTES.CHECKOUT.REFILL_CART_API(PaymentStatus.Failed)}`;

  let checkoutUrl = failureRedirectUrl;

  try {
    const storeConfigResult = await getStoreConfig({ locale });
    const storeConfig = storeConfigResult.data;

    const payload = buildPaymentPayload(
      paymentMethodType,
      orderId,
      baseUrl,
      locale,
      token,
      cardId,
      checkoutPaymentId,
      cvv,
      storeConfig?.store?.tamaraInstallments?.installments
    );

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

    if (response.status !== 200 || !response.data?.success) {
      return ok({ checkoutUrl });
    }

    try {
      const additionalData = response.data?.additional_data;

      if (additionalData && additionalData.length > 0) {
        const dataString = additionalData[0];

        // Validate that the string is valid JSON before parsing
        if (typeof dataString !== "string") {
          return ok({
            checkoutUrl,
          });
        }

        // Check if it looks like PHP array output (starts with "Array(")
        if (dataString.trim().startsWith("Array(")) {
          return ok({
            checkoutUrl,
          });
        }

        let parsedData: PaymentGatewayData;
        try {
          parsedData = JSON.parse(dataString);
        } catch {
          return ok({
            checkoutUrl,
          });
        }
        const body = parsedData.body as
          | ({
              response_code?: string;
              response_summary?: string;
            } & PaymentGatewayData["body"])
          | undefined;

        if (body) {
          const approved = (body as any).approved as boolean | null | undefined;
          const responseCode = body.response_code;
          const status = body.status?.toLowerCase();

          // Check for redirect URL first (e.g. 3DS flow, Apple Pay)
          // If we have a redirect URL, we should proceed even if status is "pending"
          const bodyAny = body as any;
          const parsedDataAny = parsedData as any;
          const redirectUrl =
            body._links?.redirect?.href ||
            bodyAny._links?.redirect_uri ||
            bodyAny.redirect_uri ||
            bodyAny.redirect_url ||
            parsedDataAny.redirect_uri ||
            parsedDataAny.redirect_url;

          if (redirectUrl) {
            checkoutUrl = redirectUrl;
          } else {
            // Only treat as declined if there's no redirect URL
            // "pending" with a redirect URL is valid (e.g. Apple Pay 3DS flow)
            const isDeclined =
              approved === false ||
              status === "declined" ||
              status === "failed" ||
              status === "rejected" ||
              status === "pending" ||
              responseCode === "Declined" ||
              responseCode === "DECLINED" ||
              responseCode === "Declined (Do not honor)";

            if (isDeclined) {
              return ok({ checkoutUrl });
            }
          }
        }

        // Check for installment redirects (Tabby, etc.)
        const installments =
          parsedData.configuration?.available_products?.installments;
        if (
          installments &&
          installments.length > 0 &&
          installments[0].web_url
        ) {
          checkoutUrl = installments[0].web_url;
        }

        // Handle Tamara (pay_by_instalments) structure
        if (parsedData.checkout_url) {
          checkoutUrl = parsedData.checkout_url;
        }

        // Handle Payfort success
        if (
          paymentMethodType === "payfortcc" &&
          parsedData.status_code === 200
        ) {
          checkoutUrl = `${baseUrl}${ROUTES.CHECKOUT.PAYMENT_SUCCESS_API}`;
        }

        // Check for general error status codes
        if (parsedData.status_code && parsedData.status_code >= 400) {
          return ok({ checkoutUrl });
        }
      }

      // CRITICAL FIX: Handle successful Checkout.com payments with no 3DS redirect
      // If payment is approved and checkoutUrl is still the default failure URL,
      // redirect to success page instead
      // Decode URL to check for failure status (it might be URL encoded)
      const decodedCheckoutUrl = decodeURIComponent(checkoutUrl);
      const isStillFailureUrl = decodedCheckoutUrl.includes(
        "payment-status=failed"
      );

      if (additionalData && additionalData.length > 0 && isStillFailureUrl) {
        try {
          const dataString = additionalData[0];
          if (
            typeof dataString === "string" &&
            !dataString.trim().startsWith("Array(")
          ) {
            const parsedData: PaymentGatewayData = JSON.parse(dataString);
            const body = parsedData.body;

            if (
              body &&
              body.approved === true &&
              (body.status === "Authorized" ||
                body.status === "authorized" ||
                body.status === "Approved" ||
                body.status === "approved")
            ) {
              checkoutUrl = `${baseUrl}${ROUTES.CHECKOUT.PAYMENT_SUCCESS_API}`;
            }
          }
        } catch {
          // Ignore parsing errors for this check
        }
      }
    } catch {
      // Parse errors don't fail the payment if we can't parse additional_data
    }

    // Extract checkout_payment_id from response body if payment succeeded
    let responseCheckoutPaymentId: string | undefined;
    try {
      const additionalData = response.data?.additional_data;
      if (additionalData && additionalData.length > 0) {
        const dataString = additionalData[0];
        if (
          typeof dataString === "string" &&
          !dataString.trim().startsWith("Array(")
        ) {
          try {
            const parsedData: PaymentGatewayData = JSON.parse(dataString);
            const body = parsedData.body;
            // checkout_payment_id is typically in body.id when payment succeeds
            if (
              body?.id &&
              body.approved !== false &&
              body.status !== "declined"
            ) {
              responseCheckoutPaymentId = body.id;
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    } catch {
      // Ignore errors extracting checkout_payment_id
    }

    return ok({
      checkoutPaymentId: responseCheckoutPaymentId,
      checkoutUrl,
    });
  } catch {
    return ok({ checkoutUrl });
  }
}

function buildPaymentPayload(
  paymentMethodType: PaymentMethodType,
  orderId: string,
  baseUrl: string,
  locale: Locale,
  token?: string,
  cardId?: string,
  checkoutPaymentId?: string,
  cvv?: string,
  tamaraInstallments?: number
): PaymentPayload {
  const cancelUrl = `${baseUrl}${ROUTES.CHECKOUT.REFILL_CART_API(PaymentStatus.Cancelled)}`;
  const failureUrl = `${baseUrl}${ROUTES.CHECKOUT.REFILL_CART_API(PaymentStatus.Failed)}`;
  const successUrl = `${baseUrl}${ROUTES.CHECKOUT.PAYMENT_SUCCESS_API}`;

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
    case "checkoutcom_pay": {
      const normalizedCardId = cardId?.trim() || undefined;
      const normalizedCheckoutPaymentId =
        checkoutPaymentId?.trim() || undefined;
      const normalizedCvv = cvv?.trim() || undefined;
      const normalizedToken = token?.trim() || undefined;

      // Cards with checkout_payment_id can be used without CVV
      if (normalizedCardId && normalizedCheckoutPaymentId) {
        const payload = {
          "3ds": {
            enabled: true,
          },
          card_id: normalizedCardId,
          checkout_payment_id: normalizedCheckoutPaymentId,
          failure_url: failureUrl,
          success_url: successUrl,
        };
        return payload;
      } else if (normalizedCardId && normalizedCvv) {
        const payload = {
          "3ds": {
            enabled: true,
          },
          card_id: normalizedCardId,
          cvv: normalizedCvv,
          failure_url: failureUrl,
          success_url: successUrl,
        };
        return payload;
      } else if (normalizedToken) {
        const payload = {
          "3ds": {
            enabled: true,
          },
          failure_url: failureUrl,
          success_url: successUrl,
          token: normalizedToken,
        };
        return payload;
      } else {
        throw new Error(
          "Either token (for new card), card_id + cvv (for saved card), or card_id + checkout_payment_id (for recorded card) is required for Checkout.com payment"
        );
      }
    }
    case "payfortcc": {
      return {
        gateway: "payfort",
        status: "completed",
      };
    }

    case "pay_by_instalments": {
      const instalmentsCount = tamaraInstallments || 4;
      return {
        instalments: String(instalmentsCount),
        is_mobile: false,
        merchant_urls: {
          cancel: cancelUrl,
          failure: failureUrl,
          success: successUrl,
        },
      };
    }

    case "payfortapplepay": {
      // Backend only needs the Apple Pay token (JSON stringified)
      // Backend will handle token conversion internally
      const normalizedToken = token?.trim();

      if (!normalizedToken) {
        throw new Error("Token is required for PayFort Apple Pay payment");
      }

      // Simplified payload - backend has everything else
      return {
        token: normalizedToken,
      };
    }

    case "tabby_installments": {
      return {
        merchant_urls: {
          cancel: cancelUrl,
          failure: failureUrl,
          success: successUrl,
        },
      };
    }

    default:
      throw new Error(`Unsupported payment method: ${paymentMethodType}`);
  }
}
