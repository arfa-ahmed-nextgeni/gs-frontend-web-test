import "server-only";

import { cache } from "react";

import { graphqlRequest } from "@/lib/clients/graphql";
import { CART_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/cart";
import { getStoreCode } from "@/lib/utils/country";

import type { Locale } from "@/lib/constants/i18n";

export const getCustomerCartId = ({
  authToken,
  locale,
}: {
  authToken: string;
  locale: Locale;
}) => getCustomerCartIdCached(authToken, locale);

const getCustomerCartIdCached = cache(
  async (authToken: string, locale: Locale) => {
    const response = await graphqlRequest({
      authToken,
      query: CART_GRAPHQL_QUERIES.GET_CUSTOMER_CART_ID,
      storeCode: getStoreCode(locale),
    });

    return response.data?.customerCart?.id || null;
  }
);
