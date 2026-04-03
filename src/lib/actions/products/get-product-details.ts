import "server-only";

import { cache } from "react";

import { getLocale } from "next-intl/server";

import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { catalogServiceGraphqlRequest } from "@/lib/clients/catalog-service-graphql";
import { CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES } from "@/lib/constants/api/catalog-service-graphql/products";
import { Locale } from "@/lib/constants/i18n";
import { ProductDetailsModel } from "@/lib/models/product-details-model";
import { failure, ok } from "@/lib/utils/service-result";

export const getProductDetails = cache(
  async ({ urlKey }: { urlKey: string }) => {
    try {
      const locale = (await getLocale()) as Locale;

      const storeConfig = await getStoreConfig({ locale });

      if (!storeConfig.data?.store) {
        return failure("Failed to get product details");
      }

      const { store } = storeConfig.data;

      let response = await catalogServiceGraphqlRequest({
        catalogStoreCode: store.storeCode,
        catalogWebsiteCode: store.websiteCode,
        query:
          CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES.GET_PRODUCT_DETAILS_BY_URL_KEY,
        storeCode: store.code,
        variables: { urlKey },
      });

      if (!response.data?.productSearch?.items?.[0]?.productView?.sku) {
        response = await catalogServiceGraphqlRequest({
          catalogStoreCode: store.storeCode,
          catalogWebsiteCode: store.websiteCode,
          query:
            CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES.GET_PRODUCT_DETAILS_BY_SKU,
          storeCode: store.code,
          variables: { sku: urlKey },
        });

        if (!response.data?.productSearch?.items?.[0]?.productView?.sku) {
          return failure("Failed to get product details");
        }
      }

      return ok(structuredClone(new ProductDetailsModel(response.data)));
    } catch (error) {
      console.error("Failed to get product details:", error);
      return failure("Failed to get product details");
    }
  }
);
