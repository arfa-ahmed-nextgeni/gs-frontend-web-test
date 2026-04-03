import { NextRequest, NextResponse } from "next/server";

import { makePaymentAction } from "@/lib/actions/checkout/make-payment";
import {
  deletePayfortResponseCode,
  getPayfortResponseCode,
  getPendingOrderInfo,
} from "@/lib/actions/cookies/checkout";
import { PaymentStatus } from "@/lib/constants/payment-status";
import { ROUTES } from "@/lib/constants/routes";
import { getBaseUrlFromRequest } from "@/lib/utils/request";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const responseCodeFromCookie = await getPayfortResponseCode();
  const responseCodeFromQuery = searchParams.get("response_code");
  const responseCode = responseCodeFromQuery ?? responseCodeFromCookie;
  const baseUrl = getBaseUrlFromRequest(request);

  const pendingOrderInfo = await getPendingOrderInfo();

  if (!pendingOrderInfo) {
    return NextResponse.json(
      { error: "Pending order ID not found" },
      { status: 400 }
    );
  }

  const {
    baseUrl: pendingOrderInfoBaseUrl,
    locale,
    orderId,
  } = pendingOrderInfo;

  if (baseUrl !== pendingOrderInfoBaseUrl) {
    return NextResponse.redirect(
      new URL(
        `${ROUTES.CHECKOUT.PAYFORT_CALLBACK_API}?${searchParams.toString()}`,
        pendingOrderInfoBaseUrl
      ),
      303
    );
  }

  // Clean up the response code cookie after reading it
  if (responseCodeFromCookie) {
    await deletePayfortResponseCode(pendingOrderInfoBaseUrl);
  }

  const failureUrl = new URL(
    ROUTES.CHECKOUT.REFILL_CART_API(PaymentStatus.Failed),
    pendingOrderInfoBaseUrl
  );

  if (responseCode === "20064" || responseCode === "14000") {
    // Call makePaymentAction to finalize the payment (similar to Flutter's _finalizeMakePayment)
    const paymentResult = await makePaymentAction({
      baseUrl: pendingOrderInfoBaseUrl,
      locale,
      orderId,
      paymentMethodType: "payfortcc",
    });

    if (paymentResult.data?.checkoutUrl) {
      return NextResponse.redirect(paymentResult.data.checkoutUrl, 303);
    } else {
      // Payment failed, redirect to failure page
      return NextResponse.redirect(failureUrl, 303);
    }
  }

  // For any other response_code (including null), treat as cancelled/failed
  // This handles cases where payment was cancelled, failed, or incomplete
  return NextResponse.redirect(failureUrl, 303);
}
