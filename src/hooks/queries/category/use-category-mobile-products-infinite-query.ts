import { useInfiniteQuery } from "@tanstack/react-query";

import { appApiRequest } from "@/lib/clients/app-client";
import { APP_API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { type Locale } from "@/lib/constants/i18n";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { type ProductCardModel } from "@/lib/models/product-card-model";
import { isError, isUnauthenticated } from "@/lib/utils/service-result";

interface CategoryProductsApiResponse {
  page?: number;
  products?: ProductCardModel[];
  totalPages?: number;
}

interface UseCategoryMobileProductsInfiniteQueryArgs {
  categoryPath: string;
  categoryUid: string;
  filters: Record<string, string[]>;
  filtersSignature: string;
  initialPage: number;
  initialProducts: ProductCardModel[];
  locale: Locale;
  searchTerm?: string;
  sortBy?: string;
  totalPages: number;
}

export const MOBILE_CATEGORY_PRODUCTS_PAGE_SIZE = 20;

export function useCategoryMobileProductsInfiniteQuery({
  categoryPath,
  categoryUid,
  filters,
  filtersSignature,
  initialPage,
  initialProducts,
  locale,
  searchTerm,
  sortBy,
  totalPages,
}: UseCategoryMobileProductsInfiniteQueryArgs) {
  return useInfiniteQuery({
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialData: {
      pageParams: [initialPage],
      pages: [
        {
          page: initialPage,
          products: initialProducts,
          totalPages,
        },
      ],
    },
    initialPageParam: initialPage,
    queryFn: async ({ pageParam }) => {
      const currentPage = Number(pageParam);
      const isSearchMode =
        categoryUid === "search" &&
        typeof searchTerm === "string" &&
        searchTerm.trim().length > 0;
      const endpoint = isSearchMode
        ? APP_API_ENDPOINTS.SEARCH.PRODUCTS({
            filters: Object.keys(filters).length > 0 ? filters : undefined,
            locale,
            page: currentPage,
            pageSize: MOBILE_CATEGORY_PRODUCTS_PAGE_SIZE,
            phrase: searchTerm,
            sortBy,
          })
        : APP_API_ENDPOINTS.CATEGORY.PRODUCTS({
            categoryPath,
            categoryUid,
            filters,
            locale,
            page: currentPage,
            pageSize: MOBILE_CATEGORY_PRODUCTS_PAGE_SIZE,
            sortBy,
          });
      const payload = await fetchCategoryProductsPayload(endpoint);
      const pageProducts = payload.products || [];

      return {
        page: payload.page || currentPage,
        products: pageProducts,
        totalPages: payload.totalPages || totalPages,
      };
    },
    queryKey: QUERY_KEYS.CATEGORY.MOBILE_PRODUCTS_INFINITE({
      categoryPath,
      categoryUid,
      filters,
      filtersSignature,
      initialPage,
      locale,
      pageSize: MOBILE_CATEGORY_PRODUCTS_PAGE_SIZE,
      searchTerm,
      sortBy,
      totalPages,
    }),
    refetchOnWindowFocus: false,
    retry: 2,
    staleTime: 2 * 60 * 1000,
  });
}

async function fetchCategoryProductsPayload(
  endpoint: string
): Promise<CategoryProductsApiResponse> {
  const response = await appApiRequest<CategoryProductsApiResponse>({
    endpoint,
  });

  if (isUnauthenticated(response)) {
    throw new Error("Unauthenticated");
  }

  if (isError(response)) {
    throw new Error(response.error || "Failed to load products");
  }

  return response.data;
}
