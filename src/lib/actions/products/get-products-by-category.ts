import "server-only";

import { cache } from "react";

import { cacheTag } from "next/cache";

import { SortEnum } from "@/catalog-service-graphql/graphql";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { catalogServiceGraphqlRequest } from "@/lib/clients/catalog-service-graphql";
import { CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES } from "@/lib/constants/api/catalog-service-graphql/products";
import { CacheTags } from "@/lib/constants/cache/tags";
import { Locale } from "@/lib/constants/i18n";
import { ProductCardVariant } from "@/lib/constants/product/product-card";
import { CategoryProductsModel } from "@/lib/models/category-products-model";
import { ok } from "@/lib/utils/service-result";

export const getProductsByCategory = ({
  category,
  locale,
  pageSize,
  variant,
}: {
  category: string;
  locale: Locale;
  pageSize: number;
  variant: ProductCardVariant;
}) => getProductsByCategoryCached(category, locale, pageSize, variant);

const getProductsByCategoryCached = cache(
  async (
    category: string,
    locale: Locale,
    pageSize: number,
    variant: ProductCardVariant
  ) => {
    "use cache";
    cacheTag(CacheTags.Magento);

    try {
      const storeConfig = await getStoreConfig({ locale });

      if (!storeConfig.data?.store) {
        return ok(structuredClone(new CategoryProductsModel(null, variant)));
      }

      const { store } = storeConfig.data;

      const response = await catalogServiceGraphqlRequest({
        catalogStoreCode: store.storeCode,
        catalogWebsiteCode: store.websiteCode,
        query: CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES.PRODUCT_SEARCH,
        storeCode: store.code,
        variables: {
          currentPage: 1,
          filter: [
            {
              attribute: "categories",
              eq: category,
            },
          ],
          pageSize,
          phrase: "",
          sort: [
            {
              attribute: "inStock",
              direction: SortEnum.Desc,
            },
          ],
        },
      });

      return ok(
        structuredClone(
          new CategoryProductsModel(response.data || null, variant)
        )
      );
    } catch (error) {
      console.error("Error getting products by category:", error, category);

      return ok(structuredClone(new CategoryProductsModel(null, variant)));
    }
  }
);
