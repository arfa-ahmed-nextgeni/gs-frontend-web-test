import "server-only";

import { cache } from "react";

import { getLocale } from "next-intl/server";

import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { catalogServiceGraphqlRequest } from "@/lib/clients/catalog-service-graphql";
import { CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES } from "@/lib/constants/api/catalog-service-graphql/products";
import { ProductLinkType } from "@/lib/constants/product/product-details";
import { LinkProducts } from "@/lib/models/link-products";
import { failure, ok } from "@/lib/utils/service-result";

import type { Locale } from "@/lib/constants/i18n";

export const getLinkProducts = async ({
  brand,
  gender,
  linkType,
  productType,
  sku,
  urlKey,
}: {
  brand: string;
  gender: string;
  linkType: ProductLinkType;
  productType: string;
  sku: string;
  urlKey?: string;
}) => {
  try {
    const locale = (await getLocale()) as Locale;

    return getLinkProductsCached(
      locale,
      brand,
      gender,
      linkType,
      productType,
      sku,
      urlKey
    );
  } catch (error) {
    console.error("Failed to get link products:", error);
    return failure("Failed to get link products");
  }
};

const getLinkProductsCached = cache(
  async (
    locale: Locale,
    brand: string,
    gender: string,
    linkType: ProductLinkType,
    productType: string,
    sku: string,
    urlKey?: string
  ) => {
    try {
      const storeConfig = await getStoreConfig({ locale });

      if (!storeConfig.data?.store) {
        return failure("Failed to get link products");
      }

      const { store } = storeConfig.data;

      const response = await catalogServiceGraphqlRequest({
        catalogStoreCode: store.storeCode,
        catalogWebsiteCode: store.websiteCode,
        query:
          linkType === ProductLinkType.AlsoLike
            ? CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES.GET_YOU_MIGHT_ALSO_LIKE_PRODUCTS
            : CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES.GET_SIMILAR_PRODUCTS,
        storeCode: store.code,
        variables: {
          brand,
          gender,
          productType,
        },
      });

      if (!response.data?.productSearch.items?.length) {
        return failure("Failed to get link products");
      }

      return ok(new LinkProducts(response.data, sku, urlKey));
    } catch (error) {
      console.error("Failed to get link products:", error);
      return failure("Failed to get link products");
    }
  }
);
