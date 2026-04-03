import "server-only";

import { cache } from "react";

import { connection } from "next/server";

import { getLocale } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CUSTOMER_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/customer";
import { Locale, LOCALE_TO_STORE } from "@/lib/constants/i18n";
import { CustomerAddresses } from "@/lib/models/customer-addresses";
import { failure, ok, unauthenticated } from "@/lib/utils/service-result";

export const getCustomerAddresses = cache(async () => {
  await connection();
  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      return unauthenticated();
    }

    const locale = (await getLocale()) as Locale;

    const response = await graphqlRequest({
      authToken,
      query: CUSTOMER_GRAPHQL_QUERIES.GET_CUSTOMER_ADDRESSES,
      storeCode: LOCALE_TO_STORE[locale],
    });

    if (!response.data?.customer) {
      return unauthenticated();
    }

    return ok(new CustomerAddresses(response.data));
  } catch (error) {
    console.error("Error fetching customer addresses:", error);
    return failure("Failed to fetch customer addresses");
  }
});
