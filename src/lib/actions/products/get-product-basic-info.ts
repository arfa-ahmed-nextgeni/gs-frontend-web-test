import "server-only";

import { cache } from "react";

import { getLocale } from "next-intl/server";

import { graphqlRequest } from "@/lib/clients/graphql";
import { PRODUCTS_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/products";
import { Locale } from "@/lib/constants/i18n";
import { ProductBasicInfo } from "@/lib/models/product-basic-info";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok } from "@/lib/utils/service-result";

export const getProductBasicInfo = async ({ urlKey }: { urlKey: string }) => {
  try {
    const locale = (await getLocale()) as Locale;

    return getProductBasicInfoCached(locale, urlKey);
  } catch (error) {
    console.error("Failed to get product basic info:", error);
    return failure("Failed to get product basic info");
  }
};

const getProductBasicInfoCached = cache(
  async (locale: Locale, urlKey: string) => {
    try {
      const storeCode = getStoreCode(locale);

      let response = await graphqlRequest({
        query: PRODUCTS_GRAPHQL_QUERIES.GET_PRODUCT_BASIC_INFO,
        storeCode,
        variables: {
          urlKey,
        },
      });

      if (!response.data?.products?.items?.length) {
        response = await graphqlRequest({
          query: PRODUCTS_GRAPHQL_QUERIES.GET_PRODUCT_BASIC_INFO_BY_SKU,
          storeCode,
          variables: {
            sku: urlKey,
          },
        });

        if (!response.data?.products?.items?.length) {
          return failure("Failed to get product basic info");
        }
      }

      return ok(structuredClone(new ProductBasicInfo(response.data)));
    } catch (error) {
      console.error("Failed to get product basic info:", error);
      return failure("Failed to get product basic info");
    }
  }
);
