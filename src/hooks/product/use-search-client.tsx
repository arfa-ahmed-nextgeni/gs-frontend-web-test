"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { appApiRequest } from "@/lib/clients/app-client";
import { APP_API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { type Locale } from "@/lib/constants/i18n";
import { SEARCH_MIN_QUERY_LENGTH } from "@/lib/constants/search";
import { type ProductCardModel } from "@/lib/models/product-card-model";
import { isAbortError } from "@/lib/utils/network-error";
import { isError, isUnauthenticated } from "@/lib/utils/service-result";

interface SearchOptions {
  locale: Locale;
  text: string;
}

interface SearchProductsClientResponse {
  facets?: unknown[];
  products?: ProductCardModel[];
  related_terms?: string[];
  suggestions?: string[];
  totalCount?: number;
}

export function useSearchAutocomplete(
  options: SearchOptions,
  enabled: boolean
) {
  const trimmedText = options.text.trim();

  return useQuery({
    enabled: enabled && trimmedText.length >= SEARCH_MIN_QUERY_LENGTH,
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }) => {
      if (trimmedText.length < SEARCH_MIN_QUERY_LENGTH) {
        return {
          facets: [],
          products: [],
          relatedTerms: [],
          suggestions: [],
          totalCount: 0,
        };
      }

      try {
        const response = await searchProductsClient({
          locale: options.locale,
          page: 1,
          pageSize: 10,
          phrase: trimmedText,
          signal,
        });

        return {
          facets: response.facets || [],
          products: response.products || [],
          relatedTerms: response.related_terms || [],
          suggestions: response.suggestions || [],
          totalCount: response.totalCount || 0,
        };
      } catch (error) {
        if (signal.aborted || isAbortError(error)) {
          throw error;
        }

        console.error("Search error:", error);
        return {
          facets: [],
          products: [],
          relatedTerms: [],
          suggestions: [],
          totalCount: 0,
        };
      }
    },
    queryKey: ["search-autocomplete", trimmedText, options.locale],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 60 * 1000,
  });
}

// Client-side search function that calls the API route
async function searchProductsClient(params: {
  locale: Locale;
  page?: number;
  pageSize?: number;
  phrase: string;
  signal?: AbortSignal;
  sortBy?: string;
}): Promise<SearchProductsClientResponse> {
  try {
    const response = await appApiRequest<SearchProductsClientResponse>({
      endpoint: APP_API_ENDPOINTS.SEARCH.AUTOCOMPLETE({
        locale: params.locale,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        phrase: params.phrase,
        sortBy: params.sortBy,
      }),
      options: {
        signal: params.signal,
      },
    });

    if (isUnauthenticated(response)) {
      throw new Error("Unauthenticated");
    }

    if (isError(response)) {
      throw new Error(response.error || "Failed to fetch search products");
    }

    return response.data;
  } catch (error) {
    if (params.signal?.aborted || isAbortError(error)) {
      throw error;
    }

    console.error("Search request failed:", error);
    return {
      facets: [],
      products: [],
      related_terms: [],
      suggestions: [],
      totalCount: 0,
    };
  }
}
