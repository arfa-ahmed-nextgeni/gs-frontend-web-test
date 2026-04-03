"use server";

import { getLocale, getTranslations } from "next-intl/server";

import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { graphqlRequest } from "@/lib/clients/graphql";
import { PRODUCTS_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/products";
import { Locale } from "@/lib/constants/i18n";
import { failure, ok } from "@/lib/utils/service-result";

export async function subscribeStockNotification({
  email,
  productId,
}: {
  email: string;
  productId: string;
}) {
  const t = await getTranslations("NotifyMeDialog");
  const locale = (await getLocale()) as Locale;
  const storeConfig = await getStoreConfig({ locale });

  try {
    const response = await graphqlRequest({
      query: PRODUCTS_GRAPHQL_MUTATIONS.SUBSCRIBE_STOCK_NOTIFICATION,
      storeCode: storeConfig.data?.store?.code,
      variables: {
        input: {
          email,
          product_id: +productId,
        },
      },
    });

    if (response.errors?.length) {
      const errorMessage =
        response.errors[0]?.message || t("errors.subscriptionFailed");
      return failure(errorMessage);
    }

    const result = response.data?.subscribeStockNotification;

    if (!result) {
      return failure(t("errors.subscriptionFailed"));
    }

    // Check if status_code indicates an error
    if (result.status_code && result.status_code !== "200") {
      return failure(result.message || t("errors.subscriptionFailed"));
    }

    return ok(result.message || t("success.message"));
  } catch (error) {
    console.error("Error subscribing to stock notification:", error);
    return failure(t("errors.subscriptionFailed"));
  }
}
