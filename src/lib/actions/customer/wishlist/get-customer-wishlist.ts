import "server-only";

import { cache } from "react";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CUSTOMER_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/customer";
import { Locale } from "@/lib/constants/i18n";
import { Wishlist } from "@/lib/models/wishlist";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok, unauthenticated } from "@/lib/utils/service-result";

export const getCustomerWishlist = cache(
  async ({
    locale,
    page,
    pageSize,
  }: {
    locale: Locale;
    page: number;
    pageSize: number;
  }) => {
    try {
      const authToken = await getAuthToken();

      if (!authToken) {
        return unauthenticated();
      }

      const response = await graphqlRequest({
        authToken,
        query: CUSTOMER_GRAPHQL_QUERIES.GET_CUSTOMER_WISHLIST,
        storeCode: getStoreCode(locale),
        variables: {
          page,
          pageSize,
        },
      });

      if (!response.data?.customer) {
        return unauthenticated();
      }

      return ok(new Wishlist(response.data));
    } catch (error) {
      console.error("Error fetching customer wishlist:", error);
      return failure("Failed to fetch customer wishlist");
    }
  }
);
