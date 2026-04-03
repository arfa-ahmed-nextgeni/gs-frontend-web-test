"use server";

import { revalidatePath } from "next/cache";
import { unauthorized } from "next/navigation";

import { getLocale, getTranslations } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { restRequest } from "@/lib/clients/rest";
import { API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { Locale, LOCALE_TO_STORE } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";

export const deleteCustomerPaymentCard = async ({ id }: { id: string }) => {
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
      endpoint: API_ENDPOINTS.CUSTOMER.DELETE_PAYMENT_CARD(id),
      options: {
        method: "DELETE",
      },
      storeCode: LOCALE_TO_STORE[locale],
    });

    const apiMessage = response?.data?.message?.replace(/\.$/, "") || "";

    if (response.status !== 200) {
      return {
        data: null,
        error: t.has(apiMessage as any)
          ? t(apiMessage as any)
          : t("cardDeleteFailed"),
        success: false,
      };
    }

    revalidatePath(ROUTES.CUSTOMER.CARDS);

    return {
      data: response.data,
      message: t.has(apiMessage as any)
        ? t(apiMessage as any)
        : t("Card deleted successfully"),
      success: true,
    };
  } catch (error) {
    console.error("Error deleting card:", error);

    return {
      data: null,
      error: t("cardDeleteFailed"),
      success: false,
    };
  }
};
