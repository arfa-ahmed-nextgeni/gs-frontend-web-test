"use server";

import { authorizeCapturePayfortPaymentAction } from "@/lib/actions/checkout/authorize-capture-payfort-payment";
import { getPayfortOrderDetailsAction } from "@/lib/actions/checkout/get-payfort-order-details";
import { deleteCartId } from "@/lib/actions/cookies/cart";
import {
  setPayfortResponseCode,
  setPendingOrderInfo,
} from "@/lib/actions/cookies/checkout";
import { Locale } from "@/lib/constants/i18n";
import { PaymentStatus } from "@/lib/constants/payment-status";
import { ROUTES } from "@/lib/constants/routes";
import { isOk, ok } from "@/lib/utils/service-result";

export async function payfortPaymentAction({
  baseUrl,
  customerEmail,
  locale,
  orderId,
  payfortCardNumber,
  payfortCvv,
  selectedPaymentCard,
}: {
  baseUrl: string;
  customerEmail?: string;
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

  let payfortResponse: Response;
  try {
    payfortResponse = await fetch(payfortDetail.url, {
      body: requestBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });
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

  // Try to extract from URL if response is a redirect
  if (payfortResponse.url && payfortResponse.url !== payfortDetail.url) {
    try {
      const urlObj = new URL(payfortResponse.url);
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
    return ok({ checkoutUrl });
  }

  // Step 6: Call authorize-capture with token_name
  const authorizeResult = await authorizeCapturePayfortPaymentAction({
    amount: normalizedAmount,
    currency: currency,
    customerEmail: finalCustomerEmail,
    language: payfortDetail.language,
    merchantReference: payfortDetail.merchant_reference,
    tokenName,
  });

  if (!isOk(authorizeResult)) {
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
