import "server-only";

import { cache } from "react";

import { graphqlRequest } from "@/lib/clients/graphql";
import { CUSTOMER_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/customer";
import { Customer } from "@/lib/models/customer";
import { isUnauthorizedRequestError } from "@/lib/utils/http-error";

const getCustomerByAuthTokenCached = cache(async (authToken: string) => {
  try {
    const response = await graphqlRequest({
      authToken,
      query: CUSTOMER_GRAPHQL_QUERIES.GET_CUSTOMER,
    });

    if (!response.data?.customer) {
      return null;
    }

    return new Customer(response.data);
  } catch (error) {
    if (isUnauthorizedRequestError(error)) {
      return null;
    }
    throw error;
  }
});

export async function getCustomerByAuthToken(
  authToken: string,
  { throwOnError = false }: { throwOnError?: boolean } = {}
) {
  try {
    return await getCustomerByAuthTokenCached(authToken);
  } catch (error) {
    console.error("Error fetching customer by auth token:", error);

    if (throwOnError) {
      throw error;
    }

    return null;
  }
}
