"use server";

import { unauthorized } from "next/navigation";

import { getLocale, getTranslations } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { checkoutRequest } from "@/lib/clients/checkout";
import { restRequest } from "@/lib/clients/rest";
import {
  API_ENDPOINTS,
  CHECKOUT_API_ENDPOINTS,
} from "@/lib/constants/api/endpoints";
import { Locale, LOCALE_TO_STORE } from "@/lib/constants/i18n";
import {
  AddPaymentCardFormField,
  addPaymentCardFormSchema,
} from "@/lib/forms/add-payment-card";
import { CheckoutTokenDto } from "@/lib/types/api/payment-card";
import { paymentCardExpiryToMonthYear } from "@/lib/utils/payment-card";

export const addCustomerPaymentCard = async (formData: FormData) => {
  const t = await getTranslations(
    "CustomerCardsPage.addNewCardDialog.messages"
  );

  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      unauthorized();
    }

    const payload = addPaymentCardFormSchema.parse(
      Object.fromEntries(formData)
    );

    const { month: expiry_month, year: expiry_year } =
      paymentCardExpiryToMonthYear(payload[AddPaymentCardFormField.CardExpiry]);

    const checkoutTokenResponse = await checkoutRequest<CheckoutTokenDto>({
      endpoint: CHECKOUT_API_ENDPOINTS.TOKENS,
      options: {
        body: JSON.stringify({
          expiry_month,
          expiry_year,
          number: payload[AddPaymentCardFormField.CardNumber],
          type: "card",
        }),
        method: "POST",
      },
    });

    if (!checkoutTokenResponse?.data?.token) {
      return {
        data: null,
        error: t("addCardFailed"),
        success: false,
      };
    }

    const locale = (await getLocale()) as Locale;
    const storeView = LOCALE_TO_STORE[locale];

    const response = await restRequest<{
      message: string;
      status_code: number;
    }>({
      authToken,
      endpoint: API_ENDPOINTS.CUSTOMER.PAYMENT_CARDS,
      options: {
        body: JSON.stringify({
          cardData: {
            default: payload[AddPaymentCardFormField.SaveAsDefault] || false,
            store_view: storeView,
            token: checkoutTokenResponse.data.token,
          },
        }),
        method: "POST",
      },
      storeCode: storeView,
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
    console.error("Error adding card:", error);

    return {
      data: null,
      error: t("addCardFailed"),
      success: false,
    };
  }
};
