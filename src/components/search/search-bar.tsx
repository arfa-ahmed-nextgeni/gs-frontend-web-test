"use client";

import { useEffect, useState } from "react";

import dynamic from "next/dynamic";

import { useTranslations } from "next-intl";

import { SearchTracker } from "@/components/analytics/search-tracker";
import {
  useSearchActions,
  useSearchUiState,
} from "@/components/search/search-container";
import { SearchForm } from "@/components/search/search-form";
import { BlurOverlay } from "@/components/ui/blur-overlay";
import useBodyScroll from "@/hooks/use-body-scroll";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { ZIndexLevel } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const loadSearchResults = () =>
  import("@/components/search/search-results").then(
    (module) => module.SearchResults
  );

const SearchResults = dynamic(loadSearchResults, {
  loading: () => null,
});

const DesktopSearchChrome = ({
  inputFocus,
  onClear,
}: {
  inputFocus: boolean;
  onClear: () => void;
}) => {
  useBodyScroll(inputFocus);

  return (
    <>
      <SearchTracker trackInit={inputFocus} />
      <BlurOverlay
        onClick={onClear}
        visible={inputFocus}
        zIndexClass={ZIndexLevel.z20}
      />
    </>
  );
};

export const SearchBar = ({ isSticky }: { isSticky?: boolean }) => {
  const {
    clear,
    handleAutoSearch,
    handleSearch,
    openMobileSearch,
    openStaticDesktopSearch,
    openStickyDesktopSearch,
  } = useSearchActions();
  const {
    hasDropdownContent: hasSearchDropdownContent,
    queryText,
    showStaticDesktopSearch,
    showStickyDesktopSearch,
  } = useSearchUiState();

  const inputFocus = isSticky
    ? showStickyDesktopSearch
    : showStaticDesktopSearch;

  const t = useTranslations("HomePage.header.search");

  const responsiveIsMobile = useIsMobile();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const effectiveIsMobile = hasMounted ? responsiveIsMobile : true;

  const placeholder = effectiveIsMobile
    ? t("mobilePlaceholder")
    : t("placeholder");

  const enableInputFocus = isSticky
    ? openStickyDesktopSearch
    : openStaticDesktopSearch;

  const handleFocus = () => {
    if (responsiveIsMobile) {
      openMobileSearch();
      return;
    }

    loadSearchResults();
    enableInputFocus();
  };

  const hasDropdownContent = inputFocus && hasSearchDropdownContent;

  return (
    <>
      {!effectiveIsMobile ? (
        <DesktopSearchChrome inputFocus={inputFocus} onClear={clear} />
      ) : null}
      <div className="flex-1">
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

          {inputFocus ? <SearchResults inputFocus={inputFocus} /> : null}
        </div>
      </div>
    </>
  );
};
