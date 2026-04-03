"use server";

import { unauthorized } from "next/navigation";

import { getLocale, getTranslations } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { restRequest } from "@/lib/clients/rest";
import { API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { Locale, LOCALE_TO_STORE } from "@/lib/constants/i18n";

export const makeDefaultPaymentCard = async ({ id }: { id: string }) => {
  const t = await getTranslations("CustomerCardsPage.messages");

  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      unauthorized();
    }

    const locale = (await getLocale()) as Locale;

    const response = await restRequest<{
      message: string;
      status_code: number;
    }>({
      authToken,
      endpoint: API_ENDPOINTS.CUSTOMER.UPDATE_CARD_WITH_PAYMENT_ID,
      options: {
        body: JSON.stringify({
          cardData: {
            checkout_payment_id: "",
            checkout_src_id: id,
            default: true,
          },
        }),
        method: "PUT",
      },
      storeCode: LOCALE_TO_STORE[locale],
    });

    const apiMessage = response?.data?.message?.replace(/\.$/, "") || "";

    if (response.status !== 200) {
      return {
        data: null,
        error: t.has(apiMessage as any) ? t(apiMessage as any) : apiMessage,
        success: false,
      };
    }

    return {
      data: response.data,
      message: t.has(apiMessage as any) ? t(apiMessage as any) : apiMessage,
      success: true,
    };
  } catch (error) {
    console.error("Error making default card:", error);

    return {
      data: null,
      error: t("makeDefaultCardFailed"),
      success: false,
    };
  }
};
