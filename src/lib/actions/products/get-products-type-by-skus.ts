import "server-only";

import { cache } from "react";

import { getLocale } from "next-intl/server";

import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { catalogServiceGraphqlRequest } from "@/lib/clients/catalog-service-graphql";
import { CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES } from "@/lib/constants/api/catalog-service-graphql/products";
import { Locale } from "@/lib/constants/i18n";
import { ProductType } from "@/lib/constants/product/product-details";
import { determineProductType } from "@/lib/utils/product-type";
import { failure, ok } from "@/lib/utils/service-result";

import type { GetProductDetailsQuery } from "@/catalog-service-graphql/graphql";

type ProductData = NonNullable<
  NonNullable<GetProductDetailsQuery["products"]>[number]
>;

/**
 * Determines product types from fetched product data
 * Returns 'beauty', 'fragrance', or 'mix' based on the products
 */
function determineProductTypesFromProducts(
  products: ProductData[]
): "beauty" | "fragrance" | "mix" {
  if (!products || products.length === 0) {
    return "mix";
  }

  const productTypes = products.map((product) => determineProductType(product));

  // Filter out gift cards
  const relevantTypes = productTypes.filter(
    (type) => type !== ProductType.GiftCard && type !== ProductType.EGiftCard
  );

  if (relevantTypes.length === 0) {
    return "mix";
  }

  // Check if all are the same type
  const allPerfume = relevantTypes.every(
    (type) => type === ProductType.Perfume
  );
  const allBeauty = relevantTypes.every((type) => type === ProductType.Beauty);

  if (allPerfume) {
    return "fragrance";
  }
  if (allBeauty) {
    return "beauty";
  }

  return "mix";
}

/**
 * Fetch products by SKUs from catalog service and determine product types
 * Returns 'beauty', 'fragrance', or 'mix' based on the products
 */
export const getProductsTypeBySkus = cache(async (skus: string[]) => {
  try {
    if (!skus || skus.length === 0) {
      return ok("mix" as const);
    }

    const locale = (await getLocale()) as Locale;
    const storeConfig = await getStoreConfig({ locale });

    if (!storeConfig.data?.store) {
      return failure("Failed to get store config");
    }

    const { store } = storeConfig.data;

    // Fetch all products in a single API call
    const response = await catalogServiceGraphqlRequest({
      catalogStoreCode: store.storeCode,
      catalogWebsiteCode: store.websiteCode,
      query: CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES.GET_PRODUCTS_BY_SKUS,
      storeCode: store.code,
      variables: { skus },
    });

    const validProducts = (response.data?.products || []).filter(
      (product) => product !== null
    );

    // Determine product types
    const productTypes = determineProductTypesFromProducts(validProducts);

    return ok(productTypes);
  } catch (error) {
    console.error("Failed to get product types by SKUs:", error);
    return failure("Failed to get product types by SKUs");
  }
});
