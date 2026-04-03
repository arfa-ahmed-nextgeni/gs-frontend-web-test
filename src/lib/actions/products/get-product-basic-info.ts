import "server-only";

import { cache } from "react";

import { getLocale } from "next-intl/server";

import { graphqlRequest } from "@/lib/clients/graphql";
import { PRODUCTS_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/products";
import { Locale } from "@/lib/constants/i18n";
import { ProductBasicInfo } from "@/lib/models/product-basic-info";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok } from "@/lib/utils/service-result";

export const getProductBasicInfo = cache(
  async ({ urlKey }: { urlKey: string }) => {
    try {
      const locale = (await getLocale()) as Locale;

      const response = await graphqlRequest({
        query: PRODUCTS_GRAPHQL_QUERIES.GET_PRODUCT_BASIC_INFO,
        storeCode: getStoreCode(locale),
        variables: {
          urlKey,
        },
      });

      if (!response.data?.products?.items?.length) {
        return failure("Failed to get product basic info");
      }

      return ok(structuredClone(new ProductBasicInfo(response.data)));
    } catch (error) {
      console.error("Failed to get product basic info:", error);
      return failure("Failed to get product basic info");
    }
  }
);
