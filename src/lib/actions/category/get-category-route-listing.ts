import "server-only";

import { cache } from "react";

import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import {
  parseFiltersFromSearchParamsRecord,
  parsePageParam,
  parsePriceRange,
  parseSortParam,
} from "@/lib/category/query";
import { catalogServiceGraphqlRequest } from "@/lib/clients/catalog-service-graphql";
import { CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES } from "@/lib/constants/api/catalog-service-graphql/products";
import { type Locale } from "@/lib/constants/i18n";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { CategoryListingModel } from "@/lib/models/category-listing-model";
import {
  type ProductSearchResponse,
  type SearchClauseInput,
} from "@/lib/types/catalog-service";
import {
  deserializeSearchParamsRecord,
  deserializeStringArrayRecord,
  type SearchParamsRecord,
  serializeSearchParamsRecord,
  serializeStringArrayRecord,
  type StringArrayRecord,
} from "@/lib/utils/cache-key-records";
import { buildProductSearchSort } from "@/lib/utils/catalog-service-transformers";
import { failure, isOk, ok } from "@/lib/utils/service-result";

const ATTRIBUTE_ALIAS_MAP: Record<string, string> = {
  giftcard_amount_values: "giftcard_amount_values",
  make_up_color: "makeup_color",
  make_up_type: "makeup_type",
  productcategory: "product_category",
  productcolor: "product_color",
  producttype: "product_type",
  sizenew: "size_new",
};

type CategoryFilters = StringArrayRecord;

interface GetCategoryListingDataArgs {
  categoryPath: string;
  filters: CategoryFilters;
  locale: Locale;
  page: number;
  pageSize: number;
  sortBy?: string;
}

interface GetCategoryRouteListingArgs {
  categoryPath: string;
  locale: Locale;
  pageSize?: number;
  search: RouteSearchParams;
}

type RouteSearchParams = SearchParamsRecord;

// React cache memoizes object args by reference, so we use stable serialized
// keys for object-shaped inputs.
export const getCategoryRouteListing = ({
  categoryPath,
  locale,
  pageSize = 20,
  search,
}: GetCategoryRouteListingArgs) =>
  getCategoryRouteListingCached(
    categoryPath,
    locale,
    pageSize,
    serializeSearchParamsRecord(search)
  );

const getCategoryRouteListingCached = cache(
  async (
    categoryPath: string,
    locale: Locale,
    pageSize: number,
    serializedSearch: string
  ) => {
    const search = deserializeSearchParamsRecord(serializedSearch);
    const queryState = {
      currentPage: parsePageParam(search[QueryParamsKey.Page]),
      filters: parseFiltersFromSearchParamsRecord(search),
      searchTerm: Array.isArray(search[QueryParamsKey.Search])
        ? search[QueryParamsKey.Search][0]
        : search[QueryParamsKey.Search],
      sortBy: parseSortParam(search[QueryParamsKey.Sort]),
    };

    const listingData = await getCategoryListingData({
      categoryPath,
      filters: queryState.filters,
      locale,
      page: queryState.currentPage,
      pageSize,
      sortBy: queryState.sortBy,
    });

    return {
      listingData: isOk(listingData)
        ? listingData.data
        : createEmptyCategoryListingModel(queryState.currentPage, pageSize),
      queryState,
    };
  }
);

export const getCategoryListingData = ({
  categoryPath,
  filters,
  locale,
  page,
  pageSize,
  sortBy,
}: GetCategoryListingDataArgs) =>
  getCategoryListingDataCached(
    categoryPath,
    locale,
    page,
    pageSize,
    sortBy,
    serializeStringArrayRecord(filters)
  );

const getCategoryListingDataCached = cache(
  async (
    categoryPath: string,
    locale: Locale,
    page: number,
    pageSize: number,
    sortBy: string | undefined,
    serializedFilters: string
  ) => {
    const filters = deserializeStringArrayRecord(serializedFilters);

    try {
      const storeConfig = await getStoreConfig({ locale });

      if (!storeConfig.data?.store) {
        return failure("Store config not available");
      }

      const { store } = storeConfig.data;
      const filterClauses = buildCategorySearchClauses(categoryPath, filters);
      const sort = buildProductSearchSort(sortBy);

      const response = await catalogServiceGraphqlRequest({
        catalogStoreCode: store.storeCode,
        catalogWebsiteCode: store.websiteCode,
        query: CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES.PRODUCT_SEARCH,
        storeCode: store.code,
        variables: {
          currentPage: page,
          filter: filterClauses,
          pageSize,
          phrase: "",
          sort,
        },
      });

      const productResponse =
        (response.data?.productSearch as ProductSearchResponse | undefined) ||
        createEmptyProductSearchResponse(page, pageSize);

      return ok(createCategoryListingModel(productResponse, page, pageSize));
    } catch (error) {
      console.error("Failed to get category listing data:", error);
      return failure("Failed to get category listing data");
    }
  }
);

function buildCategorySearchClauses(
  categoryPath: string,
  filters: Record<string, string[]>
): SearchClauseInput[] {
  const clauses: SearchClauseInput[] = [
    {
      attribute: "categories",
      eq: categoryPath.toLowerCase(),
    },
  ];

  Object.entries(filters).forEach(([attribute, values]) => {
    if (!values?.length) {
      return;
    }

    if (attribute === "price") {
      const range = parsePriceRange(values[0]);
      if (!range) {
        return;
      }

      clauses.push({
        attribute: "price",
        range,
      });
      return;
    }

    clauses.push({
      attribute: normalizeFilterAttribute(attribute),
      in: values,
    });
  });

  return clauses;
}

function createCategoryListingModel(
  productResponse: ProductSearchResponse,
  page: number,
  pageSize: number
): CategoryListingModel {
  return structuredClone(
    new CategoryListingModel({
      filtersResponse: productResponse,
      page,
      pageSize,
      productsResponse: productResponse,
    })
  );
}

function createEmptyCategoryListingModel(
  page: number,
  pageSize: number
): CategoryListingModel {
  return structuredClone(
    new CategoryListingModel({
      page,
      pageSize,
    })
  );
}

function createEmptyProductSearchResponse(
  currentPage = 1,
  pageSize = 20
): ProductSearchResponse {
  return {
    facets: [],
    items: [],
    page_info: {
      current_page: currentPage,
      page_size: pageSize,
      total_pages: 0,
    },
    total_count: 0,
  };
}

function normalizeFilterAttribute(attribute: string): string {
  const normalized = attribute
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase();

  return ATTRIBUTE_ALIAS_MAP[normalized] || normalized;
}
