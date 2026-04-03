"use client";

import { useEffect, useMemo, useState } from "react";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

import RecentSearches from "@/components/search/recent-searches";
import SearchBrandPills from "@/components/search/search-brand-pills";
import {
  useSearchActions,
  useSearchUiState,
} from "@/components/search/search-container";
import SearchResultItem from "@/components/search/search-result-item";
import { SearchSuggestion } from "@/components/search/search-suggestion";
import {
  clearStoredRecentSearches,
  getStoredRecentSearches,
} from "@/components/search/utils/search-storage";
import { useSearchAutocomplete } from "@/hooks/product/use-search-client";
import { type Locale } from "@/lib/constants/i18n";
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
  inputFocus,
  isMobile,
}: {
  inputFocus: boolean;
  isMobile?: boolean;
}) => {
  const {
    clear,
    handleBrandClick,
    handleRecentSearchClick,
    handleSuggestionClick,
    handleViewAll,
    setHasDropdownContent,
  } = useSearchActions();
  const { hasDropdownContent, queryText } = useSearchUiState();
  const locale = useLocale() as Locale;
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    getStoredRecentSearches()
  );

  const { data: searchData, isLoading } = useSearchAutocomplete(
    { locale, text: queryText },
    inputFocus
  );
  const searchResults = searchData?.products;
  const suggestions = searchData?.suggestions || [];
  const totalCount = searchData?.totalCount || 0;

  const t = useTranslations("HomePage.header.search");
  const nextHasDropdownContent =
    isLoading || !!searchResults?.length || !!recentSearches.length;

  const brands = useMemo(() => {
    const facets = searchData?.facets || [];

    return facets.length > 0 ? extractBrandsFromFacets(facets) : [];
  }, [searchData?.facets]);

  useEffect(() => {
    setHasDropdownContent(nextHasDropdownContent);

    return () => {
      setHasDropdownContent(false);
    };
  }, [nextHasDropdownContent, setHasDropdownContent]);

  if (!inputFocus) return null;

  if (!hasDropdownContent) return null;

  const handleClearRecentSearches = () => {
    clearStoredRecentSearches();
    setRecentSearches([]);
  };

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
                      onClick={clear}
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

          {searchResults.length > 0 && (
            <div className="mb-5 mt-2 bg-[#F9F9F9] py-1 text-center">
              <button
                className="text-xs font-semibold text-gray-700 hover:text-gray-900"
                onClick={handleViewAll}
              >
                {t("viewAllProducts", { count: totalCount.toString() })}
              </button>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="pb-4">
              <SearchSuggestion
                list={suggestions}
                onSuggestionClick={handleSuggestionClick}
                title={t("suggestions")}
              />
            </div>
          )}

          {brands.length > 0 && (
            <SearchBrandPills brands={brands} onBrandClick={handleBrandClick} />
          )}
        </div>
      ) : (
        <div className="p-4">
          <RecentSearches
            onClearRecent={handleClearRecentSearches}
            onSearchClick={handleRecentSearchClick}
            recentSearches={recentSearches}
          />
        </div>
      )}
    </div>
  );
};
