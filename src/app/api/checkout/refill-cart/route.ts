import { NextRequest } from "next/server";

import { getTranslations } from "next-intl/server";

import { refillCartAction } from "@/lib/actions/checkout/refill-cart";
import {
  deletePendingOrderInfo,
  getPendingOrderInfo,
} from "@/lib/actions/cookies/checkout";
import { Locale } from "@/lib/constants/i18n";
import { PaymentStatus } from "@/lib/constants/payment-status";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { ROUTES } from "@/lib/constants/routes";
import {
  createErrorHtml,
  createRedirectHtml,
} from "@/lib/utils/html-templates";
import { getLocaleInfo } from "@/lib/utils/locale";
import { getBaseUrlFromRequest } from "@/lib/utils/request";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const paymentStatus = searchParams.get(QueryParamsKey.PaymentStatus);
  const baseUrl = getBaseUrlFromRequest(request);

  const pendingOrderInfo = await getPendingOrderInfo();

  if (!pendingOrderInfo) {
    const t = await getTranslations({
      locale: Locale.en_SA,
      namespace: "RedirectPage",
    });

    const errorHtml = createErrorHtml({
      heading: t("badRequest"),
      message: t("orderInfoMissing"),
    });

    return new Response(errorHtml, {
      headers: { "Content-Type": "text/html" },
      status: 400,
    });
  }

  const {
    baseUrl: pendingOrderInfoBaseUrl,
    locale,
    orderId,
  } = pendingOrderInfo;

  const t = await getTranslations({
    locale,
    namespace: "RedirectPage",
  });

  if (baseUrl !== pendingOrderInfoBaseUrl) {
    const redirectUrl = new URL(
      `${ROUTES.CHECKOUT.REFILL_CART_API(PaymentStatus.Failed).split("?")[0]}?${searchParams.toString()}`,
      pendingOrderInfoBaseUrl
    ).toString();

    const redirectHtml = createRedirectHtml({
      redirectUrl,
      secondaryText: t("ifNotRedirected"),
    });

    return new Response(redirectHtml, {
      headers: { "Content-Type": "text/html" },
      status: 200,
    });
  }

  await refillCartAction(orderId, locale);

  await deletePendingOrderInfo(pendingOrderInfoBaseUrl);

  const { language } = getLocaleInfo(locale);

  const checkoutUrl = new URL(
    `/${language}${ROUTES.CHECKOUT.ROOT}`,
    pendingOrderInfoBaseUrl
  );

  // Add payment status to query params if present
  if (paymentStatus) {
    checkoutUrl.searchParams.set(QueryParamsKey.PaymentStatus, paymentStatus);
  }

  const checkoutUrlString = checkoutUrl.toString();

  const redirectHtml = createRedirectHtml({
    primaryText: t("redirectingToCheckout"),
    redirectUrl: checkoutUrlString,
    secondaryText: t("ifNotRedirected"),
  });

  return new Response(redirectHtml, {
    headers: { "Content-Type": "text/html" },
    status: 200,
  });
}
