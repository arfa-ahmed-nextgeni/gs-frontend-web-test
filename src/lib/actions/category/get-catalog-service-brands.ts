import "server-only";

import { cache } from "react";

import { cacheTag } from "next/cache";

import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { catalogServiceGraphqlRequest } from "@/lib/clients/catalog-service-graphql";
import { CATALOG_SERVICE_CATEGORIES_GRAPHQL_QUERIES } from "@/lib/constants/api/catalog-service-graphql/categories";
import { CacheTags } from "@/lib/constants/cache/tags";
import { type Locale } from "@/lib/constants/i18n";
import { failure, ok } from "@/lib/utils/service-result";

const BRANDS_CATEGORY_ID = "77";
const BRANDS_SUBTREE_DEPTH = 2;
const BRANDS_SUBTREE_START_LEVEL = 1;

export interface CatalogServiceBrand {
  id: string;
  name: string;
  urlKey: string;
  urlPath: string;
}

export const getCatalogServiceBrands = ({ locale }: { locale: Locale }) =>
  getCatalogServiceBrandsCached(locale);

const getCatalogServiceBrandsCached = cache(async (locale: Locale) => {
  "use cache";
  cacheTag(CacheTags.Magento);

  try {
    const storeConfig = await getStoreConfig({ locale });

    if (!storeConfig.data?.store) {
      return failure("Store config not available");
    }

    const { store } = storeConfig.data;

    const response = await catalogServiceGraphqlRequest({
      catalogStoreCode: store.storeCode,
      catalogWebsiteCode: store.websiteCode,
      query: CATALOG_SERVICE_CATEGORIES_GRAPHQL_QUERIES.GET_BRAND_CATEGORIES,
      storeCode: store.code,
      variables: {
        depth: BRANDS_SUBTREE_DEPTH,
        ids: [BRANDS_CATEGORY_ID],
        startLevel: BRANDS_SUBTREE_START_LEVEL,
      },
    });

    const categories = response.data?.categories;

    if (!categories?.length) {
      return failure("Failed to get brand categories");
    }

    const brands: CatalogServiceBrand[] = categories
      .filter(
        (cat) =>
          Boolean(cat.id && cat.name && cat.urlPath) &&
          cat.id !== BRANDS_CATEGORY_ID // exclude the root "Brands" category itself
      )
      .map((cat) => ({
        id: cat.id as string,
        name: cat.name as string,
        urlKey: cat.urlKey || "",
        urlPath: cat.urlPath as string,
      }));

    return ok(brands);
  } catch (error) {
    console.error("Failed to get catalog service brand categories:", error);
    return failure("Failed to get brand categories");
  }
});
