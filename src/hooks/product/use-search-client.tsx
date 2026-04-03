"use client";

import { useQuery } from "@tanstack/react-query";

import { appApiRequest } from "@/lib/clients/app-client";
import { APP_API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { type Locale } from "@/lib/constants/i18n";
import { type ProductCardModel } from "@/lib/models/product-card-model";
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
  return useQuery({
    enabled: enabled && options.text.length >= 2,
    queryFn: async () => {
      if (!options.text || options.text.length < 2) {
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
          phrase: options.text,
        });

        return {
          facets: response.facets || [],
          products: response.products || [],
          relatedTerms: response.related_terms || [],
          suggestions: response.suggestions || [],
          totalCount: response.totalCount || 0,
        };
      } catch (error) {
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
    queryKey: [
      "search-autocomplete",
      options.text,
      options.locale,
      options.text.length,
    ],
    staleTime: 2 * 60 * 1000,
  });
}

// Client-side search function that calls the API route
async function searchProductsClient(params: {
  locale: Locale;
  page?: number;
  pageSize?: number;
  phrase: string;
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
    });

    if (isUnauthenticated(response)) {
      throw new Error("Unauthenticated");
    }

    if (isError(response)) {
      throw new Error(response.error || "Failed to fetch search products");
    }

    return response.data;
  } catch (error) {
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
