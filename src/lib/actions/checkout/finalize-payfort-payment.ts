"use server";

import { getTranslations } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { restRequest } from "@/lib/clients/rest";
import { ORDER_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { Locale } from "@/lib/constants/i18n";
import { getCommonErrorMessage } from "@/lib/utils/common-error-message";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok } from "@/lib/utils/service-result";

type FinalizePayfortPaymentRequest = {
  orderId: string;
  payload: {
    authorization_code?: string;
    gateway: "payfort";
    status: "completed" | "failed";
    token_name?: string;
  };
};

type FinalizePayfortPaymentResponse = {
  error?: string;
  message?: string;
  success: boolean;
};

export async function finalizePayfortPaymentAction({
  authorizationCode,
  locale,
  orderId,
  status,
  tokenName,
}: {
  authorizationCode?: string;
  locale: Locale;
  orderId: string;
  status: "completed" | "failed";
  tokenName?: string;
}) {
  const tCommonErrors = await getTranslations("CommonErrors");
  console.info(
    "[finalizePayfortPaymentAction] Starting finalize PayFort payment"
  );
  const authToken = await getAuthToken();

  try {
    const storeCode = getStoreCode(locale);

    const payload: FinalizePayfortPaymentRequest["payload"] = {
      gateway: "payfort",
      status,
    };

    if (tokenName) {
      payload.token_name = tokenName;
    }

    if (authorizationCode) {
      payload.authorization_code = authorizationCode;
    }

    const requestPayload: FinalizePayfortPaymentRequest = {
      orderId,
      payload,
    };

    const response = await restRequest<FinalizePayfortPaymentResponse>({
      authToken: authToken ?? undefined,
      endpoint: ORDER_ENDPOINTS.MAKE_PAYMENT,
      options: {
        body: JSON.stringify(requestPayload),
        method: "POST",
      },
      storeCode,
    });

    if (response.status !== 200) {
      const errorMessage =
        response.data?.error ||
        response.data?.message ||
        "Failed to finalize payment";
      return failure(errorMessage);
    }

    if (!response.data?.success) {
      const errorMessage =
        response.data?.error ||
        response.data?.message ||
        "Failed to finalize payment";
      return failure(errorMessage);
    }

    // Never delete cart for PayFort orders - allow retry and refill
    // Cart will be handled by the backend or can be refilled if needed

    return ok<FinalizePayfortPaymentResponse>(response.data);
  } catch (error) {
    return failure(
      getCommonErrorMessage({
        error,
        fallbackMessage: "Failed to finalize payment",
        tCommonErrors,
      })
    );
  }
}
