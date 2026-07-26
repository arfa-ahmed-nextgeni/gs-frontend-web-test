"use server";

import { getTranslations } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { paymentsServiceRequest } from "@/lib/clients/payments-service";
import { HEADERS } from "@/lib/constants/api";
import { getCommonErrorMessage } from "@/lib/utils/common-error-message";
import { getForwardedRequestHeaders } from "@/lib/utils/forwarded-request-headers";
import { failure, ok } from "@/lib/utils/service-result";

type AuthorizeCapturePayfortPaymentRequest = {
  amount: string;
  currency: string;
  customer_email: string;
  customer_ip?: string;
  language: string;
  merchant_reference: string;
  return_url: string;
  token_name?: string;
};

type AuthorizeCapturePayfortPaymentResponse = {
  body: {
    "3ds_url": string;
    amount: number;
    command: string;
    currency: string;
    eci: string;
    fort_id: string;
    language: string;
    merchant_reference: string;
    payment_option: string;
    response_code: string;
    response_message: string;
    status: string;
  };
  errors: Record<string, unknown>;
  exception: unknown[];
  message: string;
  status_code: number;
};

export async function authorizeCapturePayfortPaymentAction({
  amount,
  currency,
  customerEmail,
  forwardHeaders,
  language,
  merchantReference,
  returnUrl,
  tokenName,
}: {
  amount: string;
  currency: string;
  customerEmail: string;
  forwardHeaders?: HeadersInit;
  language: string;
  merchantReference: string;
  returnUrl: string;
  tokenName?: string;
}) {
  const tCommonErrors = await getTranslations("CommonErrors");
  const authToken = await getAuthToken();

  try {
    const resolvedForwardHeaders = new Headers(
      forwardHeaders ?? (await getForwardedRequestHeaders())
    );
    // The Payments Service requires customer_ip as an explicit body field —
    // it does not derive it from X-Forwarded-For/X-Real-IP/True-Client-IP.
    // Confirmed live: real UAT client IPs were still rejected with
    // "Missing parameter : customer_ip" until this was added.
    const customerIp =
      resolvedForwardHeaders.get(HEADERS.X_FORWARDED_FOR) ?? undefined;

    const requestPayload: AuthorizeCapturePayfortPaymentRequest = {
      amount,
      currency,
      customer_email: customerEmail,
      language,
      merchant_reference: merchantReference,
      return_url: returnUrl,
      ...(customerIp && { customer_ip: customerIp }),
      ...(tokenName && { token_name: tokenName }),
    };

    const response =
      await paymentsServiceRequest<AuthorizeCapturePayfortPaymentResponse>({
        authToken: authToken ?? undefined,
        endpoint: "/api/rest/v1/payments/payfort/ae/gs/do-authorize-capture",
        forwardHeaders: resolvedForwardHeaders,
        options: {
          body: JSON.stringify(requestPayload),
          method: "POST",
        },
      });

    if (response.status !== 200) {
      const errorMessage =
        response.data?.message || "Failed to authorize and capture payment";
      return failure(errorMessage);
    }

    // Check response codes based on PayFort documentation
    // Response codes:
    // - "20064" with 3ds_url: Success, but 3DS verification required
    // - "14000": Success, payment completed (no 3DS or 3DS completed)
    const responseCode = response.data?.body?.response_code;

    // Check if order was already processed (this might be OK if payment succeeded)
    const isOrderAlreadyProcessed =
      response.data?.message?.toLowerCase().includes("already processed") ||
      responseCode === "00047";

    // Success cases:
    // 1. Response code "20064" (3DS flow required - authorize-capture succeeded)
    // 2. Response code "14000" (payment completed)
    // 3. Order already processed with 200 status
    // NOTE: `status === "00"` was previously also treated as success, but a
    // real "Missing parameter : customer_ip" error response also carried
    // `status: "00"` — that field is not a reliable success signal on its
    // own, so success is now decided purely by response_code.
    const isSuccess =
      responseCode === "20064" ||
      responseCode === "14000" ||
      (isOrderAlreadyProcessed && response.data?.status_code === 200);

    if (!isSuccess) {
      const errorMessage =
        response.data?.body?.response_message ||
        response.data?.message ||
        "Failed to authorize and capture payment";
      return failure(errorMessage);
    }

    return ok<AuthorizeCapturePayfortPaymentResponse>(response.data);
  } catch (error) {
    // Handle HTML error responses from the server
    if (
      error instanceof Error &&
      (error.message.includes("Non-JSON response") ||
        error.message.includes("Unexpected response") ||
        error.message.includes("Endpoint not found"))
    ) {
      return failure(tCommonErrors("backendUnavailable"));
    }

    return failure(
      getCommonErrorMessage({
        error,
        fallbackMessage: "Failed to authorize and capture payment",
        tCommonErrors,
      })
    );
  }
}
