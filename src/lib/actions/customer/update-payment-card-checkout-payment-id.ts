"use server";

import { unauthorized } from "next/navigation";

import { getLocale } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { restRequest } from "@/lib/clients/rest";
import { API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { Locale, LOCALE_TO_STORE } from "@/lib/constants/i18n";

export const updatePaymentCardCheckoutPaymentId = async ({
  checkoutPaymentId,
  checkoutSrcId,
}: {
  checkoutPaymentId: string;
  checkoutSrcId: string;
}) => {
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
            checkout_payment_id: checkoutPaymentId,
            checkout_src_id: checkoutSrcId,
            default: false,
          },
        }),
        method: "PUT",
      },
      storeCode: LOCALE_TO_STORE[locale],
    });

    const apiMessage = response?.data?.message?.replace(/\.$/, "") || "";

    if (response.status !== 200) {
      console.error(
        "[updatePaymentCardCheckoutPaymentId] Failed to update payment card:",
        apiMessage
      );
      return {
        data: null,
        error: apiMessage || "Failed to update payment card",
        success: false,
      };
    }

    return {
      data: response.data,
      message: apiMessage,
      success: true,
    };
  } catch (error) {
    console.error("Error updating payment card checkout_payment_id:", error);

    return {
      data: null,
      error: "Failed to update payment card",
      success: false,
    };
  }
};
