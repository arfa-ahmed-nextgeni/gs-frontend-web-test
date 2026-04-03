import "server-only";

import { cache } from "react";

import { getLocale } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CUSTOMER_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/customer";
import { Locale } from "@/lib/constants/i18n";
import { failure, ok, unauthenticated } from "@/lib/utils/service-result";

export const getCustomerWalletBalance = cache(async () => {
  const authToken = await getAuthToken();
  const locale = (await getLocale()) as Locale;

  if (!authToken) {
    return unauthenticated();
  }

  try {
    const storeConfig = await getStoreConfig({ locale });

    if (!storeConfig.data?.store) {
      return failure("Failed to fetch customer wallet balance");
    }

    const response = await graphqlRequest({
      authToken,
      query: CUSTOMER_GRAPHQL_QUERIES.GET_CUSTOMER_REWARD_POINTS_BALANCE,
      storeCode: storeConfig.data.store.code,
    });

    if (!response.data?.customer) {
      return unauthenticated();
    }

    return ok(response.data.customer.reward_points);
  } catch (error) {
    console.error("Error fetching customer wallet balance:", error);
    return failure("Failed to fetch customer wallet balance");
  }
});
