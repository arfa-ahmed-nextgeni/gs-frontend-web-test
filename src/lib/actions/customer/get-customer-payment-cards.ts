import "server-only";

import { cache } from "react";

import { connection } from "next/server";

import { getLocale } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { restRequest } from "@/lib/clients/rest";
import { API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { Locale, LOCALE_TO_STORE } from "@/lib/constants/i18n";
import { PaymentCardCollection } from "@/lib/models/payment-card";
import { CustomerPaymentCardDto } from "@/lib/types/api/payment-card";
import { failure, ok, unauthenticated } from "@/lib/utils/service-result";

export const getCustomerPaymentCards = cache(async () => {
  await connection();
  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      return unauthenticated();
    }

    const locale = (await getLocale()) as Locale;

    const response = await restRequest<CustomerPaymentCardDto[]>({
      authToken,
      endpoint: API_ENDPOINTS.CUSTOMER.PAYMENT_CARDS,
      storeCode: LOCALE_TO_STORE[locale],
    });

    return ok(new PaymentCardCollection(response.data));
  } catch (error) {
    console.error("Error fetching cards:", error);

    return failure("Failed to fetch cards");
  }
});
