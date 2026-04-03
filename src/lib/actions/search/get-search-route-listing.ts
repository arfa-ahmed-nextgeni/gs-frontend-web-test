import "server-only";

import { cache } from "react";

import { SortEnum } from "@/catalog-service-graphql/graphql";
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
import { convertSortToProductSearchSort } from "@/lib/utils/catalog-service-transformers";
import { failure, isOk, ok } from "@/lib/utils/service-result";

export interface SearchRouteQueryState {
  currentPage: number;
  filters: SearchFilters;
  searchTerm?: string;
  sortBy?: string;
}

interface GetSearchListingDataArgs {
  filters: SearchFilters;
  locale: Locale;
  page: number;
  pageSize: number;
  phrase?: string;
  sortBy?: string;
}

interface GetSearchRouteListingArgs {
  locale: Locale;
  pageSize?: number;
  search: RouteSearchParams;
}

type RouteSearchParams = SearchParamsRecord;

type SearchFilters = StringArrayRecord;

// React cache memoizes object args by reference, so we use stable serialized
// keys for object-shaped inputs.
export const getSearchRouteListing = ({
  locale,
  pageSize = 20,
  search,
}: GetSearchRouteListingArgs) =>
  getSearchRouteListingCached(
    locale,
    pageSize,
    serializeSearchParamsRecord(search)
  );

const getSearchRouteListingCached = cache(
  async (locale: Locale, pageSize: number, serializedSearch: string) => {
    const search = deserializeSearchParamsRecord(serializedSearch);
    const queryState: SearchRouteQueryState = {
      currentPage: parsePageParam(search[QueryParamsKey.Page]),
      filters: parseFiltersFromSearchParamsRecord(search),
      searchTerm: Array.isArray(search[QueryParamsKey.Search])
        ? search[QueryParamsKey.Search][0]
        : search[QueryParamsKey.Search],
      sortBy: parseSortParam(search[QueryParamsKey.Sort]),
    };

    const listingData = await getSearchListingData({
      filters: queryState.filters,
      locale,
      page: queryState.currentPage,
      pageSize,
      phrase: queryState.searchTerm,
      sortBy: queryState.sortBy,
    });

    return {
      listingData: isOk(listingData)
        ? listingData.data
        : createEmptySearchListingModel(queryState.currentPage, pageSize),
      queryState,
    };
  }
);

export const getSearchListingData = ({
  filters,
  locale,
  page,
  pageSize,
  phrase,
  sortBy,
}: GetSearchListingDataArgs) =>
  getSearchListingDataCached(
    locale,
    page,
    pageSize,
    phrase,
    sortBy,
    serializeStringArrayRecord(filters)
  );

const getSearchListingDataCached = cache(
  async (
    locale: Locale,
    page: number,
    pageSize: number,
    phrase: string | undefined,
    sortBy: string | undefined,
    serializedFilters: string
  ) => {
    const filters = deserializeStringArrayRecord(serializedFilters);

    if (!phrase || phrase.trim().length < 2) {
      return ok(createEmptySearchListingModel(page, pageSize));
    }

    try {
      const storeConfig = await getStoreConfig({ locale });

      if (!storeConfig.data?.store) {
        return failure("Store config not available");
      }

      const { store } = storeConfig.data;
      const sort = [
        { attribute: "inStock", direction: SortEnum.Desc },
        ...(convertSortToProductSearchSort(sortBy) || []),
      ];

      const response = await catalogServiceGraphqlRequest({
        catalogStoreCode: store.storeCode,
        catalogWebsiteCode: store.websiteCode,
        query: CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES.PRODUCT_SEARCH,
        storeCode: store.code,
        variables: {
          currentPage: page,
          filter: buildSearchClauses(filters),
          pageSize,
          phrase,
          sort,
        },
      });

      const productResponse =
        (response.data?.productSearch as ProductSearchResponse | undefined) ||
        createEmptyProductSearchResponse(page, pageSize);

      return ok(createSearchListingModel(productResponse, page, pageSize));
    } catch (error) {
      console.error("Failed to get search listing data:", error);
      return failure("Failed to get search listing data");
    }
  }
);

function buildSearchClauses(
  filters: Record<string, string[]>
): SearchClauseInput[] | undefined {
  const clauses: SearchClauseInput[] = [];

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

    if (values.length > 1) {
      clauses.push({
        attribute,
        in: values,
      });
      return;
    }

    clauses.push({
      attribute,
      eq: values[0],
    });
  });

  return clauses.length > 0 ? clauses : undefined;
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
    related_terms: [],
    suggestions: [],
    total_count: 0,
  };
}

function createEmptySearchListingModel(
  page: number,
  pageSize: number
): CategoryListingModel {
  return createSearchListingModel(
    createEmptyProductSearchResponse(page, pageSize),
    page,
    pageSize
  );
}

function createSearchListingModel(
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
