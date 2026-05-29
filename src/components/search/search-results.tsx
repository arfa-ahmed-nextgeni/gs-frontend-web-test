"use client";

import { useEffect, useMemo, useState } from "react";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

import RecentSearches from "@/components/search/recent-searches";
import SearchBrandPills, {
  type BrandSuggestion,
} from "@/components/search/search-brand-pills";
import {
  useSearchActions,
  useSearchUiState,
} from "@/components/search/search-container";
import SearchResultItem from "@/components/search/search-result-item";
import { SearchSuggestion } from "@/components/search/search-suggestion";
import {
  clearStoredRecentSearches,
  getStoredRecentSearches,
  saveRecentSearch,
} from "@/components/search/utils/search-storage";
import { Spinner } from "@/components/ui/spinner";
import { useSearchAutocomplete } from "@/hooks/product/use-search-client";
import { Link } from "@/i18n/navigation";
import { type Locale } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import { SEARCH_MIN_QUERY_LENGTH } from "@/lib/constants/search";
import { cn } from "@/lib/utils";

const extractBrandsFromFacets = (facets: any[]): BrandSuggestion[] => {
  const brandFacet = facets.find(
    (facet: any) => facet.attribute === "brand_new"
  );

  if (!brandFacet || !brandFacet.buckets) {
    return [];
  }

  // urlPath is injected server-side in /api/search/route.ts by matching
  // brand names against the full cached getBrands() list, covering all
  // brands regardless of what appears in the categories facet.
  return brandFacet.buckets
    .filter((bucket: any) => bucket.title && bucket.title.trim())
    .map((bucket: any) => ({
      title: bucket.title,
      urlPath: bucket.urlPath,
    }))
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
    setHasDropdownContent,
  } = useSearchActions();
  const { hasDropdownContent, queryText } = useSearchUiState();
  const locale = useLocale() as Locale;
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    getStoredRecentSearches()
  );

  const { data: searchData, isPending } = useSearchAutocomplete(
    { locale, text: queryText },
    inputFocus
  );

  const t = useTranslations("HomePage.header.search");

  const trimmedQuery = queryText.trim();
  const canSearch = trimmedQuery.length >= SEARCH_MIN_QUERY_LENGTH;
  const searchResults = canSearch ? searchData?.products || [] : [];
  const suggestions = canSearch ? searchData?.suggestions || [] : [];
  const totalCount = canSearch ? searchData?.totalCount || 0 : 0;
  const brands = useMemo<BrandSuggestion[]>(() => {
    if (!canSearch) {
      return [];
    }

    const facets = searchData?.facets || [];
    return facets.length > 0 ? extractBrandsFromFacets(facets) : [];
  }, [canSearch, searchData?.facets]);

  const hasResults = searchResults.length > 0;
  const showSearchSpinner = canSearch && isPending && !hasResults;

  const nextHasDropdownContent =
    showSearchSpinner ||
    hasResults ||
    suggestions.length > 0 ||
    brands.length > 0 ||
    !!recentSearches.length;

  useEffect(() => {
    setHasDropdownContent(nextHasDropdownContent);
  }, [nextHasDropdownContent, setHasDropdownContent]);

  useEffect(() => {
    return () => {
      setHasDropdownContent(false);
    };
  }, [setHasDropdownContent]);

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
      {showSearchSpinner ? (
        <div
          aria-busy="true"
          aria-live="polite"
          className="flex items-center justify-center py-10"
        >
          <Spinner size={24} variant="dark" />
        </div>
      ) : hasResults ? (
        <div className="px-2 pb-7 pt-5">
          <div>
            <h3 className="text-text-primary mx-4 text-sm font-semibold">
              {t("bestResults")}
            </h3>
            <div className="space-y-0">
              {searchResults!.slice(0, 5).map((product, index) => {
                return (
                  <div
                    key={
                      product.id ? String(product.id) : `search-result-${index}`
                    }
                  >
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

          {trimmedQuery && (
            <div className="mb-5 mt-2 bg-[#F9F9F9] py-1 text-center">
              <Link
                className="text-xs font-semibold text-gray-700 hover:text-gray-900"
                href={`${ROUTES.SEARCH}?q=${encodeURIComponent(trimmedQuery)}`}
                onClick={() => {
                  saveRecentSearch(trimmedQuery);
                }}
              >
                {t("viewAllProducts", { count: totalCount.toString() })}
              </Link>
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
