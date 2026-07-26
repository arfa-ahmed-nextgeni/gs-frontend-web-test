"use server";

import { authorizeCapturePayfortPaymentAction } from "@/lib/actions/checkout/authorize-capture-payfort-payment";
import { getPayfortOrderDetailsAction } from "@/lib/actions/checkout/get-payfort-order-details";
import { deleteCartId } from "@/lib/actions/cookies/cart";
import {
  setPayfortResponseCode,
  setPendingOrderInfo,
} from "@/lib/actions/cookies/checkout";
import {
  ApiActivityFeatures,
  ApiActivityServices,
} from "@/lib/api-activity/api-activity-meta";
import { loggedFetch } from "@/lib/api-activity/fetch/logged-fetch";
import { HEADERS } from "@/lib/constants/api";
import { Locale } from "@/lib/constants/i18n";
import { PaymentStatus } from "@/lib/constants/payment-status";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { ROUTES } from "@/lib/constants/routes";
import { applyForwardHeaders } from "@/lib/utils/forwarded-headers";
import { isOk, ok } from "@/lib/utils/service-result";

export async function payfortPaymentAction({
  baseUrl,
  customerEmail,
  forwardHeaders,
  locale,
  orderId,
  payfortCardNumber,
  payfortCvv,
  selectedPaymentCard,
}: {
  baseUrl: string;
  customerEmail?: string;
  forwardHeaders?: HeadersInit;
  locale: Locale;
  orderId: string;
  payfortCardNumber?: string;
  payfortCvv?: string;
  selectedPaymentCard?: {
    checkoutPaymentId?: null | string;
    expiry?: string;
    id: string;
    sourceId: string;
  } | null;
}) {
  const failureRedirectUrl = `${baseUrl}${ROUTES.CHECKOUT.REFILL_CART_API(PaymentStatus.Failed)}`;
  const returnUrl = `${baseUrl}${ROUTES.CHECKOUT.PAYFORT_CALLBACK_API}`;

  let checkoutUrl = failureRedirectUrl;

  if (!orderId) {
    return ok({ checkoutUrl });
  }

  // Validate required PayFort data
  if (!payfortCardNumber || !payfortCvv || !selectedPaymentCard?.expiry) {
    return ok({ checkoutUrl });
  }

  // Step 1: Get PayFort order details
  const payfortDetailsResult = await getPayfortOrderDetailsAction({
    forwardHeaders,
    locale,
    orderId,
  });

  if (!isOk(payfortDetailsResult)) {
    return ok({ checkoutUrl });
  }

  const payfortDetails = payfortDetailsResult.data;
  const payfortDetail = payfortDetails.payfortDetail;

  if (!payfortDetail?.url) {
    return ok({ checkoutUrl });
  }

  // Get customer email from order details if not provided
  // The PayFort order details API returns customer_email from the order
  const finalCustomerEmail =
    customerEmail || payfortDetails.customer_email || "";

  if (!finalCustomerEmail) {
    return ok({ checkoutUrl });
  }

  // Step 2: Format expiry date from MM/YY to YYMM (PayFort expects YYMM)

  // Step 3: Build POST data
  const amount = payfortDetails.amount || 0;
  const normalizedAmount = String(amount);
  const currency = payfortDetails.currency || payfortDetail.currency || "SAR";
  const normalizedCvv = String(payfortCvv).trim().replace(/\D/g, "");

  if (normalizedCvv.length !== 3) {
    return ok({ checkoutUrl });
  }

  const postData: Record<string, string> = {
    access_code: payfortDetail.access_code,
    amount: normalizedAmount,
    card_number: payfortCardNumber.replace(/\s/g, ""),
    card_security_code: normalizedCvv,
    currency: currency,
    expiry_date: formatExpiryForPayfort(selectedPaymentCard.expiry),
    language: payfortDetail.language,
    merchant_identifier: payfortDetail.merchant_identifier,
    merchant_reference: payfortDetail.merchant_reference,
    // Must match the return_url the signature was computed against — PayFort
    // validates the signature over all submitted fields, so swapping this
    // for a different URL (e.g. our own callback route) without recomputing
    // the signature server-side invalidates every request with "Signature
    // mismatch". Use `returnUrl` (our callback) only for the authorize-
    // capture call below, which is a separate, unsigned request.
    return_url: payfortDetail.return_url,
    service_command: payfortDetail.service_command,
    signature: payfortDetail.signature,
  };

  // Step 4: Make POST request to PayFort
  const formData = new URLSearchParams();
  Object.entries(postData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const requestBody = formData.toString();
  const requestHeaders = new Headers();

  requestHeaders.set(HEADERS.CONTENT_TYPE, "application/x-www-form-urlencoded");
  applyForwardHeaders(requestHeaders, forwardHeaders);

  let payfortResponse: Response;
  try {
    payfortResponse = await loggedFetch(
      payfortDetail.url,
      {
        body: requestBody,
        headers: requestHeaders,
        method: "POST",
        // PayFort's tokenization response is a redirect to `return_url`,
        // carrying token_name/response_code/etc. as query params on the
        // Location header itself — we only need to read that header, not
        // actually request the destination. Letting fetch() auto-follow it
        // (the default) meant our server issued an unauthenticated GET to
        // whatever `return_url` pointed at (e.g. the Payments Service's own
        // callback endpoint), which correctly rejects it with 401 since
        // that endpoint requires its own API key — a real request our
        // server had no business making, and whose result we never used.
        redirect: "manual",
      },
      {
        action: "payfort payment",
        feature: ApiActivityFeatures.Checkout,
        initiator:
          "src/lib/actions/checkout/payfort-payment.ts#payfortPaymentAction",
        service: ApiActivityServices.Payfort,
      }
    );
  } catch (error) {
    console.error(error);
    return ok({ checkoutUrl });
  }

  // Step 5: Parse response
  const responseText = await payfortResponse.text();

  // Try to parse as JSON first
  let responseData: any = null;
  try {
    responseData = JSON.parse(responseText);
  } catch {
    // Not JSON, might be HTML or URL parameters
  }

  // Try to extract params from the redirect's Location header, if present
  // (see the `redirect: "manual"` comment above for why we read the header
  // directly instead of following the redirect).
  const redirectLocation = payfortResponse.headers.get("location");
  if (redirectLocation) {
    try {
      const urlObj = new URL(redirectLocation, payfortDetail.url);
      const params = Object.fromEntries(urlObj.searchParams.entries());
      responseData = { ...responseData, ...params };
    } catch {
      // Ignore URL parsing errors
    }
  }

  // Extract token_name from response
  const tokenName =
    responseData?.token_name || responseData?.body?.token_name || null;

  if (!tokenName) {
    // PayFort rejected tokenization (e.g. invalid amount, signature
    // mismatch, declined). Log the raw reason for debugging and forward the
    // response code so checkout can surface a specific message instead of a
    // silent generic failure.
    const responseCode = extractPayfortResponseCode(responseData);
    const responseMessage =
      responseData?.response_message ??
      responseData?.body?.response_message ??
      null;
    console.error("[payfortPaymentAction] Tokenization failed", {
      merchantReference: payfortDetail.merchant_reference,
      responseCode,
      responseMessage,
    });
    return ok({
      checkoutUrl: appendReasonCode(failureRedirectUrl, responseCode),
    });
  }

  // Step 6: Call authorize-capture with token_name
  const authorizeResult = await authorizeCapturePayfortPaymentAction({
    amount: normalizedAmount,
    currency: currency,
    customerEmail: finalCustomerEmail,
    forwardHeaders,
    language: payfortDetail.language,
    merchantReference: payfortDetail.merchant_reference,
    returnUrl,
    tokenName,
  });

  if (!isOk(authorizeResult)) {
    // Authorize/capture was rejected by the Payments Service / PayFort. Log
    // the raw reason for debugging so failures aren't silent.
    console.error("[payfortPaymentAction] Authorize/capture failed", {
      merchantReference: payfortDetail.merchant_reference,
      reason: authorizeResult.error,
    });
    return ok({ checkoutUrl });
  }

  await deleteCartId();
  await setPendingOrderInfo({
    baseUrl,
    locale,
    orderId,
  });

  // Store response code in cookie for callback handling
  const responseCode = authorizeResult.data?.body?.response_code ?? "unknown";
  await setPayfortResponseCode({ baseUrl, responseCode });

  // Step 7: Check if 3DS URL is present and valid
  const threeDSUrl = authorizeResult.data?.body?.["3ds_url"];
  if (threeDSUrl) {
    // Validate that threeDSUrl is a valid URL
    try {
      new URL(threeDSUrl);
      checkoutUrl = threeDSUrl;
      return ok({ checkoutUrl });
    } catch {
      // Invalid URL (e.g., "N/A"), return with default checkoutUrl
      return ok({ checkoutUrl });
    }
  }

  // Step 8: Payment succeeded without 3DS, proceed to makePaymentAction
  // (fall through to makePaymentAction call below)
  return ok({ checkoutUrl: undefined });
}

function appendReasonCode(failureUrl: string, responseCode: null | string) {
  if (!responseCode) {
    return failureUrl;
  }

  try {
    const url = new URL(failureUrl);
    url.searchParams.set(QueryParamsKey.PaymentReasonCode, responseCode);
    return url.toString();
  } catch {
    return failureUrl;
  }
}

function extractPayfortResponseCode(responseData: unknown): null | string {
  if (!responseData || typeof responseData !== "object") {
    return null;
  }

  const data = responseData as {
    body?: { response_code?: unknown };
    response_code?: unknown;
  };
  const code = data.response_code ?? data.body?.response_code;

  return typeof code === "string" && code.length > 0 ? code : null;
}

function formatExpiryForPayfort(expiry: string): string {
  const digitsOnly = expiry.replace(/\D/g, "");
  if (digitsOnly.length !== 4) {
    throw new Error(
      `Invalid expiry date format: ${expiry}. Expected MM/YY format.`
    );
  }
  const month = digitsOnly.substring(0, 2);
  const year = digitsOnly.substring(2, 4);
  const monthNum = parseInt(month, 10);
  if (monthNum < 1 || monthNum > 12) {
    throw new Error(
      `Invalid expiry month: ${monthNum}. Month must be between 01 and 12.`
    );
  }
  return `${year}${month}`;
}
