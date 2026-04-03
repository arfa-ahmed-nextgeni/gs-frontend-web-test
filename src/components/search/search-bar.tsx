"use client";

import { useTranslations } from "next-intl";

import { SearchTracker } from "@/components/analytics/search-tracker";
import { useSearch } from "@/components/search/search-container";
import { SearchForm } from "@/components/search/search-form";
import { SearchResults } from "@/components/search/search-results";
import { BlurOverlay } from "@/components/ui/blur-overlay";
import useBodyScroll from "@/hooks/use-body-scroll";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { ZIndexLevel } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

export const SearchBar = ({ isSticky }: { isSticky?: boolean }) => {
  const {
    clear,
    clearRecentSearches,
    facets,
    handleAutoSearch,
    handleBrandClick,
    handleRecentSearchClick,
    handleSearch,
    handleSuggestionClick,
    handleViewAll,
    isLoading,
    openMobileSearch,
    openStaticDesktopSearch,
    openStickyDesktopSearch,
    queryText,
    recentSearches,
    relatedTerms,
    searchResults,
    showStaticDesktopSearch,
    showStickyDesktopSearch,
    suggestions,
    totalCount,
  } = useSearch();

  const inputFocus = isSticky
    ? showStickyDesktopSearch
    : showStaticDesktopSearch;

  useBodyScroll(inputFocus);

  const t = useTranslations("HomePage.header.search");

  const isMobile = useIsMobile();

  const placeholder = isMobile ? t("mobilePlaceholder") : t("placeholder");

  const enableInputFocus = isSticky
    ? openStickyDesktopSearch
    : openStaticDesktopSearch;

  const handleFocus = () => {
    if (isMobile) openMobileSearch();
    else enableInputFocus();
  };

  const hasDropdownContent =
    inputFocus &&
    (isLoading ||
      (searchResults && searchResults.length > 0) ||
      (recentSearches && recentSearches.length > 0));

  return (
    <>
      <SearchTracker trackInit={inputFocus} />
      <div className="flex-1">
        <BlurOverlay
          onClick={clear}
          visible={inputFocus}
          zIndexClass={ZIndexLevel.z20}
        />

        <div className="relative z-30 mx-auto flex w-full shrink-0 flex-col justify-center">
          <SearchForm
            inputProps={{
              className: cn({
                "rounded-3xl": !hasDropdownContent,
                "rounded-b-none rounded-t-3xl": hasDropdownContent,
              }),
              name: "search",
              onChange: handleAutoSearch,
            }}
            onFocus={handleFocus}
            onSubmit={handleSearch}
            placeholder={placeholder}
            value={queryText}
          />

          <SearchResults
            facets={facets}
            inputFocus={inputFocus}
            isLoading={isLoading}
            onBrandClick={handleBrandClick}
            onClear={clear}
            onClearRecent={clearRecentSearches}
            onRecentSearchClick={handleRecentSearchClick}
            onSuggestionClick={handleSuggestionClick}
            onViewAll={handleViewAll}
            queryText={queryText}
            recentSearches={recentSearches}
            relatedTerms={relatedTerms}
            searchResults={searchResults}
            suggestions={suggestions}
            totalCount={totalCount}
          />
        </div>
      </div>
    </>
  );
};
