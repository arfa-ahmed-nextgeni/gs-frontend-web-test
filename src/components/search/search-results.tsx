"use client";

import { useMemo } from "react";

import { useTranslations } from "next-intl";

import RecentSearches from "@/components/search/recent-searches";
import SearchBrandPills from "@/components/search/search-brand-pills";
import SearchResultItem from "@/components/search/search-result-item";
import { SearchSuggestion } from "@/components/search/search-suggestion";
import { type ProductCardModel } from "@/lib/models/product-card-model";
import { cn } from "@/lib/utils";

const extractBrandsFromFacets = (facets: any[]): string[] => {
  const brandFacet = facets.find(
    (facet: any) => facet.attribute === "brand_new"
  );

  if (!brandFacet || !brandFacet.buckets) {
    return [];
  }
  return brandFacet.buckets
    .map((bucket: any) => bucket.title)
    .filter((title: string) => title && title.trim())
    .slice(0, 6);
};

export const SearchResults = ({
  facets = [],
  inputFocus,
  isLoading,
  isMobile,
  onBrandClick,
  onClear,
  onClearRecent,
  onRecentSearchClick,
  onSuggestionClick,
  onViewAll,
  queryText,
  recentSearches = [],
  searchResults,
  suggestions = [],
  totalCount = 0,
}: {
  facets?: any[];
  inputFocus: boolean;
  isLoading: boolean;
  isMobile?: boolean;
  onBrandClick?: (brand: string) => void;
  onClear: () => void;
  onClearRecent: () => void;
  onRecentSearchClick: (searchTerm: string) => void;
  onSuggestionClick?: (suggestion: string) => void;
  onViewAll?: () => void;
  queryText?: string;
  recentSearches?: string[];
  relatedTerms?: string[];
  searchResults?: ProductCardModel[];
  suggestions?: string[];
  totalCount?: number;
}) => {
  const t = useTranslations("HomePage.header.search");

  const brands = useMemo(() => {
    return facets.length > 0 ? extractBrandsFromFacets(facets) : [];
  }, [facets]);

  if (!inputFocus) return null;

  const hasContent =
    isLoading ||
    (searchResults && searchResults.length > 0) ||
    (recentSearches && recentSearches.length > 0);

  if (!hasContent) return null;

  return (
    <div
      className={cn("flex-1 overflow-y-auto", {
        "absolute left-0 right-0 top-10 z-50 max-h-[80vh] rounded-b-xl border border-gray-200 bg-white shadow-xl":
          !isMobile,
        "max-h-[80dvh] rounded-b-3xl ltr:left-0 rtl:right-0": !isMobile,
      })}
    >
      {searchResults && searchResults.length > 0 ? (
        <div className="px-2 pb-7 pt-5">
          <div>
            <h3 className="text-text-primary mx-4 text-sm font-semibold">
              {t("bestResults")}
            </h3>
            <div className="space-y-0">
              {searchResults.slice(0, 5).map((product, index) => {
                return (
                  <div key={product.id || Math.random()}>
                    <SearchResultItem
                      onClick={onClear}
                      position={index + 1}
                      product={product}
                      searchTerm={queryText}
                    />
                    {index < 4 && (
                      <div className="border-b border-gray-100"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {onViewAll && (
            <div className="mb-5 mt-2 bg-[#F9F9F9] py-1 text-center">
              <button
                className="text-xs font-semibold text-gray-700 hover:text-gray-900"
                onClick={onViewAll}
              >
                {t("viewAllProducts", { count: totalCount.toString() })}
              </button>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="pb-4">
              <SearchSuggestion
                list={suggestions}
                onSuggestionClick={(suggestion) => {
                  onSuggestionClick?.(suggestion);
                }}
                title={t("suggestions")}
              />
            </div>
          )}

          {onBrandClick && brands.length > 0 && (
            <SearchBrandPills brands={brands} onBrandClick={onBrandClick} />
          )}
        </div>
      ) : (
        <div className="p-4">
          <RecentSearches
            onClearRecent={onClearRecent}
            onSearchClick={onRecentSearchClick}
            recentSearches={recentSearches}
          />
        </div>
      )}
    </div>
  );
};
