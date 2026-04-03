"use server";

import { getLocale, getTranslations } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { getCartId } from "@/lib/actions/cookies/cart";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CART_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/cart";
import { Locale } from "@/lib/constants/i18n";
import { getCommonErrorMessage } from "@/lib/utils/common-error-message";
import { failure, ok } from "@/lib/utils/service-result";

export async function validateBinAction({ binNumber }: { binNumber: string }) {
  const tCommonErrors = await getTranslations("CommonErrors");
  try {
    const authToken = await getAuthToken();
    const locale = (await getLocale()) as Locale;
    const cartId = await getCartId();

    if (!cartId) {
      return failure("No active cart found");
    }

    if (!binNumber || binNumber.length < 6) {
      return failure("Valid BIN number is required (at least 6 digits)");
    }

    const storeConfig = await getStoreConfig({ locale });

    const response = await graphqlRequest({
      authToken,
      query: CART_GRAPHQL_MUTATIONS.VALIDATE_BIN,
      storeCode: storeConfig.data.store?.code,
      variables: {
        binNumber,
        cartId,
      },
    });

    if (response.errors?.length) {
      const errorMessage =
        response.errors?.[0]?.message || "Failed to validate BIN";
      return failure(errorMessage);
    }

    const validateBinData = response.data?.validateBin ?? null;

    if (!validateBinData) {
      return failure("Failed to validate BIN");
    }

    return ok(validateBinData);
  } catch (error) {
    console.error("Error validating BIN:", error);
    return failure(
      getCommonErrorMessage({
        error,
        fallbackMessage: "Failed to validate BIN",
        tCommonErrors,
      })
    );
  }
}
