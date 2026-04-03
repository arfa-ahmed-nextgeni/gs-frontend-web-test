import "server-only";

import { graphqlRequest } from "@/lib/clients/graphql";
import { PRODUCTS_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/products";
import { StoreCode } from "@/lib/constants/i18n";

export async function getCategories({
  storeCode,
}: {
  storeCode: StoreCode;
  variables?: {
    currentPage?: number;
    filter?: unknown;
    pageSize?: number;
    search?: string;
  };
}) {
  try {
    const response = await graphqlRequest({
      query: PRODUCTS_GRAPHQL_QUERIES.GET_CATEGORIES,
      storeCode,
    });
    return {
      data: response.data?.categories?.items || [],
      success: true,
      // totalCount: response.data?.products?.total_count || 0,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      data: [],
      error: "Failed to fetch products",
      success: false,
      totalCount: 0,
    };
  }
}

export async function getCategoryProducts({
  storeCode,
}: {
  storeCode: StoreCode;
  variables?: {
    currentPage?: number;
    filter?: unknown;
    pageSize?: number;
    search?: string;
  };
}) {
  try {
    const response = await graphqlRequest({
      query: PRODUCTS_GRAPHQL_QUERIES.GET_CATEGORY_PRODUCTS,
      storeCode,
    });
    return {
      data: response.data?.products?.items || [],
      success: true,
      totalCount: response.data?.products?.total_count || 0,
    };
  } catch (error) {
    console.error("Error searching products:", error);
    return {
      data: [],
      error: "Failed to search products",
      success: false,
      totalCount: 0,
    };
  }
}

export async function searchProducts({
  storeCode,
}: {
  storeCode: StoreCode;
  variables?: {
    currentPage?: number;
    filter?: unknown;
    pageSize?: number;
    search?: string;
  };
}) {
  try {
    const response = await graphqlRequest({
      query: PRODUCTS_GRAPHQL_QUERIES.SEARCH_PRODUCTS,
      storeCode,
    });
    return {
      data: response.data?.products?.items || [],
      success: true,
      totalCount: response.data?.products?.total_count || 0,
    };
  } catch (error) {
    console.error("Error searching products:", error);
    return {
      data: [],
      error: "Failed to search products",
      success: false,
      totalCount: 0,
    };
  }
}
