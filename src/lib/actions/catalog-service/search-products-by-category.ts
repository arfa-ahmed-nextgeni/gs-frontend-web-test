import "server-only";

import {
  ProductSearchResponse,
  SortEnum,
} from "@/catalog-service-graphql/graphql";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { catalogServiceGraphqlRequest } from "@/lib/clients/catalog-service-graphql";
import { CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES } from "@/lib/constants/api/catalog-service-graphql/products";

import type { Locale } from "@/lib/constants/i18n";

export async function searchProductsByAttributeAction({
  attribute = "categories",
  category,
  locale,
  quantity = 20,
}: {
  attribute?: string;
  category: string;
  locale: Locale;
  quantity?: number;
}) {
  try {
    const storeConfigResult = await getStoreConfig({ locale });

    if (!storeConfigResult.data.store) {
      return {
        facets: [],
        items: [],
        page_info: {
          page_size: quantity,
          total_pages: 0,
        },
        total_count: 0,
      };
    }

    const { store } = storeConfigResult.data;

    const response = await catalogServiceGraphqlRequest({
      catalogStoreCode: store.storeCode,
      catalogWebsiteCode: store.websiteCode,
      query: CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES.PRODUCT_SEARCH,
      storeCode: store.code,
      variables: {
        currentPage: 1,
        filter: [
          {
            attribute,
            eq: category,
          },
        ],
        pageSize: quantity,
        phrase: "",
        sort: [
          {
            attribute: "inStock",
            direction: SortEnum.Desc,
          },
        ],
      },
    });

    if (!response.data?.productSearch) {
      return {
        facets: [],
        items: [],
        page_info: {
          current_page: 1,
          page_size: quantity,
          total_pages: 0,
        },
        total_count: 0,
      };
    }

    return response.data.productSearch as ProductSearchResponse;
  } catch (error) {
    console.error("Error in searchProducts:", error);
    return {
      facets: [],
      items: [],
      page_info: {
        page_size: quantity,
        total_pages: 0,
      },
      total_count: 0,
    };
  }
}
