"use client";

import { useEffect, useRef } from "react";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useTranslations } from "next-intl";

import { SearchTracker } from "@/components/analytics/search-tracker";
import { CloseIcon } from "@/components/icons/close-icon";
import { useSearch } from "@/components/search/search-container";
import { SearchForm } from "@/components/search/search-form";
import { SearchResults } from "@/components/search/search-results";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import useBodyScroll from "@/hooks/use-body-scroll";
import { trackSearchInit } from "@/lib/analytics/events";

export const MobileSearchDialog = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    clear,
    clearRecentSearches,
    closeMobileSearch,
    facets,
    handleAutoSearch,
    handleBrandClick,
    handleRecentSearchClick,
    handleSearch,
    handleSuggestionClick,
    handleViewAll,
    isLoading,
    queryText,
    recentSearches,
    relatedTerms,
    searchResults,
    showMobileSearch,
    suggestions,
    totalCount,
  } = useSearch();

  useEffect(() => {
    if (showMobileSearch) {
      trackSearchInit();
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [showMobileSearch]);

  useBodyScroll(showMobileSearch);

  const t = useTranslations("HomePage.header.search");

  return (
    <>
      <SearchTracker trackInit={showMobileSearch} />
      <Dialog open={showMobileSearch}>
        <VisuallyHidden>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>{t("mobilePlaceholder")}</DialogDescription>
        </VisuallyHidden>
        <DialogContent
          className="max-w-auto flex h-dvh w-full flex-col gap-0 rounded-none border-none p-0"
          showCloseButton={false}
        >
          <div className="mx-auto flex w-full flex-row gap-5 px-2.5 py-1.5">
            <SearchForm
              inputProps={{
                className: "focus:bg-bg-surface",
                name: "mobile-search",
                onChange: handleAutoSearch,
                ref: inputRef,
              }}
              onSubmit={handleSearch}
              placeholder={t("mobilePlaceholder")}
              searchId="mobile-search"
              value={queryText}
            />

            <DialogClose asChild>
              <button onClick={closeMobileSearch}>
                <CloseIcon />
              </button>
            </DialogClose>
          </div>
          <SearchResults
            facets={facets}
            inputFocus={showMobileSearch}
            isLoading={isLoading}
            isMobile
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
        </DialogContent>
      </Dialog>
    </>
  );
};
