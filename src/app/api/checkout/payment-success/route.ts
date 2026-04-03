import { getTranslations } from "next-intl/server";

import { deleteCartId } from "@/lib/actions/cookies/cart";
import {
  deletePendingOrderInfo,
  getPendingOrderInfo,
} from "@/lib/actions/cookies/checkout";
import { Locale } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import {
  createErrorHtml,
  createRedirectHtml,
} from "@/lib/utils/html-templates";
import { getLocaleInfo } from "@/lib/utils/locale";

export async function GET() {
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

  const { baseUrl, locale, orderId } = pendingOrderInfo;

  await deleteCartId();
  await deletePendingOrderInfo(baseUrl);

  const { language } = getLocaleInfo(locale);

  const t = await getTranslations({
    locale,
    namespace: "RedirectPage",
  });

  const orderConfirmationUrl = new URL(
    `/${language}${ROUTES.CHECKOUT.ORDER_CONFIRMATION(orderId)}`,
    baseUrl
  ).toString();

  const redirectHtml = createRedirectHtml({
    primaryText: t("redirectingToOrderConfirmation"),
    redirectUrl: orderConfirmationUrl,
    secondaryText: t("ifNotRedirected"),
  });

  return new Response(redirectHtml, {
    headers: { "Content-Type": "text/html" },
    status: 200,
  });
}
