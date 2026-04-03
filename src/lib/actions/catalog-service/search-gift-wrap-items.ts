import "server-only";

import { getLocale } from "next-intl/server";

import { ProductSearchResponse } from "@/catalog-service-graphql/graphql";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { catalogServiceGraphqlRequest } from "@/lib/clients/catalog-service-graphql";
import { CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES } from "@/lib/constants/api/catalog-service-graphql/products";
import { Locale } from "@/lib/constants/i18n";

const DEFAULT_SEARCH_RESPONSE = {
  facets: [],
  items: [],
  page_info: {
    page_size: 50,
    total_pages: 0,
  },
  total_count: 0,
};

export async function searchGiftWrapItems() {
  try {
    const locale = (await getLocale()) as Locale;

    const storeConfigResult = await getStoreConfig({ locale });

    if (!storeConfigResult.data?.store) {
      return DEFAULT_SEARCH_RESPONSE;
    }

    const response = await catalogServiceGraphqlRequest({
      catalogStoreCode: storeConfigResult.data.store.storeCode,
      catalogWebsiteCode: storeConfigResult.data.store.websiteCode,
      query: CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES.PRODUCT_SEARCH,
      storeCode: storeConfigResult.data?.store?.code,
      variables: {
        currentPage: 1,
        filter: [
          {
            attribute: "product_meta_type",
            in: ["wrap"],
          },
        ],
        pageSize: 50,
        phrase: "",
      },
    });

    if (!response.data?.productSearch) {
      return DEFAULT_SEARCH_RESPONSE;
    }

    return response.data.productSearch as ProductSearchResponse;
  } catch (error) {
    console.error("Error in searchGiftWrapItems:", error);
    return DEFAULT_SEARCH_RESPONSE;
  }
}
