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
import { useBrandFuzzySearch } from "@/hooks/use-brand-fuzzy-search";
import { Link } from "@/i18n/navigation";
import { type Locale } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import { SEARCH_MIN_QUERY_LENGTH } from "@/lib/constants/search";

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
  const { allBrands, hasDropdownContent, queryText } = useSearchUiState();
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
  const fuzzyBrands = useBrandFuzzySearch(allBrands, queryText);
  const brands = useMemo<BrandSuggestion[]>(
    () =>
      canSearch
        ? fuzzyBrands.map((b) => ({ title: b.name, urlPath: b.urlPath }))
        : [],
    [canSearch, fuzzyBrands]
  );

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

  const handleProductResultClick = () => {
    if (trimmedQuery) {
      setRecentSearches(saveRecentSearch(trimmedQuery));
    }

    clear();
  };

  const content = (
    <>
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
                      onClick={handleProductResultClick}
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

          {brands.length > 0 && (
            <div className="pb-4">
              <SearchBrandPills
                brands={brands}
                onBrandClick={handleBrandClick}
              />
            </div>
          )}

          {suggestions.length > 0 && (
            <SearchSuggestion
              list={suggestions}
              onSuggestionClick={handleSuggestionClick}
              title={t("suggestions")}
            />
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
    </>
  );

  if (isMobile) {
    return (
      <div className="flex-1 overflow-y-auto overscroll-contain">{content}</div>
    );
  }

  return (
    <div className="absolute left-0 right-0 top-10 z-50 rounded-b-2xl border border-gray-200 bg-white pb-3 shadow-xl ltr:left-0 rtl:right-0">
      <div className="search-dropdown-scroll max-h-[80dvh] overflow-y-auto overscroll-contain">
        {content}
      </div>
    </div>
  );
};
