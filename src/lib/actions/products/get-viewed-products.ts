import "server-only";

import { getLocale } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { getDeviceIdCookie } from "@/lib/actions/cookies/device-id";
import { getCustomerByAuthToken } from "@/lib/actions/customer/get-customer-by-auth-token";
import { catalogServiceGraphqlRequest } from "@/lib/clients/catalog-service-graphql";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES } from "@/lib/constants/api/catalog-service-graphql/products";
import { PRODUCTS_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/products";
import { Locale } from "@/lib/constants/i18n";
import { ViewedProducts } from "@/lib/models/viewed-products";
import { ok } from "@/lib/utils/service-result";

import type { GetViewedProductInput } from "@/graphql/graphql";

const emptyViewedProductsResult = ok(new ViewedProducts({ products: [] }));

export async function getViewedProducts() {
  try {
    const authToken = await getAuthToken();
    const input: GetViewedProductInput = {};

    if (authToken) {
      const currentCustomer = await getCustomerByAuthToken(authToken);
      if (currentCustomer?.phoneNumber) {
        input.mobile_number = currentCustomer.phoneNumber.replace(/\D/g, "");
      } else {
        return emptyViewedProductsResult;
      }
    } else {
      const deviceId = await getDeviceIdCookie();

      if (!deviceId) {
        return emptyViewedProductsResult;
      }

      input.device_id = deviceId;
    }

    const locale = (await getLocale()) as Locale;
    const storeConfig = await getStoreConfig({ locale });

    const store = storeConfig.data.store;

    const viewedProductsResponse = await graphqlRequest({
      authToken,
      query: PRODUCTS_GRAPHQL_QUERIES.GET_VIEWED_PRODUCTS,
      storeCode: store?.code,
      variables: {
        input,
      },
    });

    const skus = (
      viewedProductsResponse.data?.getViewedProducts?.product_skus || []
    )
      .filter((sku): sku is string => Boolean(sku))
      .map((sku) => sku.trim())
      .filter(Boolean);

    if (!skus.length) {
      return emptyViewedProductsResult;
    }

    const uniqueSkus = Array.from(new Set(skus));

    if (!store) {
      return emptyViewedProductsResult;
    }

    const productsResponse = await catalogServiceGraphqlRequest({
      catalogStoreCode: store.storeCode,
      catalogWebsiteCode: store.websiteCode,
      query: CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES.GET_PRODUCTS_BY_SKUS,
      storeCode: store.code,
      variables: { skus: uniqueSkus },
    });

    if (!productsResponse.data?.products?.length) {
      return emptyViewedProductsResult;
    }

    return ok(new ViewedProducts(productsResponse.data));
  } catch (error) {
    console.error("Failed to get viewed products:", error);
    return emptyViewedProductsResult;
  }
}
