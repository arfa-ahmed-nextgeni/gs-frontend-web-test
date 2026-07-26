"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { useSearchParams } from "next/navigation";

import { AsyncBoundary } from "@/components/common/async-boundary";
import { saveRecentSearch } from "@/components/search/utils/search-storage";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  trackSearchFreetext,
  trackSearchRecent,
  trackSearchSuggestion,
} from "@/lib/analytics/events";
import { ROUTES } from "@/lib/constants/routes";
import {
  isCategoryPath,
  isProductPath,
  isSearchPath,
} from "@/lib/utils/routes";

import type { BrandSuggestion } from "@/components/search/search-brand-pills";
import type { CatalogServiceBrand } from "@/lib/actions/category/get-catalog-service-brands";

type SearchActions = {
  clear: () => void;
  closeMobileSearch: () => void;
  closeSearchUi: () => void;
  closeStaticDesktopSearch: () => void;
  closeStickyDesktopSearch: () => void;
  handleAutoSearch: (e: React.FormEvent<HTMLInputElement>) => void;
  handleBrandClick: (brand: BrandSuggestion) => void;
  handleRecentSearchClick: (searchTerm: string) => void;
  handleSearch: (e: React.SyntheticEvent) => void;
  handleSuggestionClick: (suggestion: string) => void;
  openMobileSearch: () => void;
  openStaticDesktopSearch: () => void;
  openStickyDesktopSearch: () => void;
  setHasDropdownContent: (hasContent: boolean) => void;
};

type SearchState = {
  allBrands: CatalogServiceBrand[];
  hasDropdownContent: boolean;
  isNavigating: boolean;
  queryText: string;
  showMobileSearch: boolean;
  showStaticDesktopSearch: boolean;
  showStickyDesktopSearch: boolean;
};

const SearchActionsContext = createContext<null | SearchActions>(null);
const SearchStateContext = createContext<null | SearchState>(null);

export function SearchContainer({
  allBrands = [],
  children,
}: {
  allBrands?: CatalogServiceBrand[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [queryText, setQueryText] = useState("");
  const [hasDropdownContent, setHasDropdownContent] = useState(false);
  const [showStaticDesktopSearch, setShowStaticDesktopSearch] = useState(false);
  const [showStickyDesktopSearch, setShowStickyDesktopSearch] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isNavigating, startTransition] = useTransition();
  const queryTextRef = useRef(queryText);

  queryTextRef.current = queryText;

  // Clear search text when the user navigates away from catalog/product/search pages
  useEffect(() => {
    const isSearchRelatedPage =
      isSearchPath(pathname) ||
      isCategoryPath(pathname) ||
      isProductPath(pathname);
    if (!isSearchRelatedPage) {
      setQueryText("");
    }
  }, [pathname]);

  const navigate = useCallback(
    (route: string, mode: "push" | "replace" = "push") => {
      startTransition(() => {
        if (mode === "replace") router.replace(route);
        else router.push(route);
      });
    },
    [router]
  );

  const clear = useCallback(() => {
    setQueryText("");
    setHasDropdownContent(false);
    setShowStaticDesktopSearch(false);
    setShowStickyDesktopSearch(false);
    setShowMobileSearch(false);
  }, []);

  const closeSearchUi = useCallback(() => {
    setHasDropdownContent(false);
    setShowStaticDesktopSearch(false);
    setShowStickyDesktopSearch(false);
    setShowMobileSearch(false);
  }, []);

  const handleSearch = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      const currentQueryText = queryTextRef.current.trim();
      if (!currentQueryText) {
        return;
      }

      const submittedForm = e.currentTarget as HTMLFormElement;
      const searchInput = submittedForm.querySelector("input");
      if (searchInput instanceof HTMLInputElement) {
        searchInput.blur();
      }

      // Track search_freetext when search is submitted
      trackSearchFreetext(currentQueryText);
      saveRecentSearch(currentQueryText);
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(currentQueryText)}`);
    },
    [navigate]
  );

  const handleBrandClick = useCallback(
    (brand: BrandSuggestion) => {
      saveRecentSearch(brand.title);
      if (brand.urlPath) {
        navigate(ROUTES.CATEGORY.BY_SLUG(brand.urlPath));
      } else {
        navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(brand.title)}`);
      }
    },
    [navigate]
  );

  const handleRecentSearchClick = useCallback(
    (searchTerm: string) => {
      const trimmed = searchTerm.trim();
      if (!trimmed) return;

      saveRecentSearch(trimmed);
      trackSearchRecent(trimmed);
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(trimmed)}`);
    },
    [navigate]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      saveRecentSearch(suggestion);
      // Track search_suggestion when an item in search suggestion is selected
      trackSearchSuggestion(suggestion, queryTextRef.current);
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(suggestion)}`);
    },
    [navigate]
  );

  const handleAutoSearch = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setQueryText(e.currentTarget.value);
    },
    []
  );

  const openMobileSearch = useCallback(() => {
    setShowMobileSearch(true);
    setShowStaticDesktopSearch(false);
    setShowStickyDesktopSearch(false);
  }, []);

  const closeMobileSearch = useCallback(() => {
    clear();
  }, [clear]);

  const openStaticDesktopSearch = useCallback(() => {
    setShowStaticDesktopSearch(true);
    setShowStickyDesktopSearch(false);
    setShowMobileSearch(false);
  }, []);

  const openStickyDesktopSearch = useCallback(() => {
    setShowStickyDesktopSearch(true);
    setShowStaticDesktopSearch(false);
    setShowMobileSearch(false);
  }, []);

  const closeStaticDesktopSearch = useCallback(() => {
    setShowStaticDesktopSearch(false);
  }, []);

  const closeStickyDesktopSearch = useCallback(() => {
    setShowStickyDesktopSearch(false);
  }, []);

  const searchActionsValue = useMemo(
    () => ({
      clear,
      closeMobileSearch,
      closeSearchUi,
      closeStaticDesktopSearch,
      closeStickyDesktopSearch,
      handleAutoSearch,
      handleBrandClick,
      handleRecentSearchClick,
      handleSearch,
      handleSuggestionClick,
      openMobileSearch,
      openStaticDesktopSearch,
      openStickyDesktopSearch,
      setHasDropdownContent,
    }),
    [
      clear,
      closeMobileSearch,
      closeSearchUi,
      closeStaticDesktopSearch,
      closeStickyDesktopSearch,
      handleAutoSearch,
      handleBrandClick,
      handleRecentSearchClick,
      handleSearch,
      handleSuggestionClick,
      openMobileSearch,
      openStaticDesktopSearch,
      openStickyDesktopSearch,
      setHasDropdownContent,
    ]
  );

  const searchStateValue = useMemo(
    () => ({
      allBrands,
      hasDropdownContent,
      isNavigating,
      queryText,
      showMobileSearch,
      showStaticDesktopSearch,
      showStickyDesktopSearch,
    }),
    [
      allBrands,
      hasDropdownContent,
      isNavigating,
      queryText,
      showMobileSearch,
      showStaticDesktopSearch,
      showStickyDesktopSearch,
    ]
  );

  return (
    <SearchActionsContext.Provider value={searchActionsValue}>
      <SearchStateContext.Provider value={searchStateValue}>
        <AsyncBoundary fallback={null}>
          <RouteChangeCloser onChange={clear} />
        </AsyncBoundary>
        {children}
      </SearchStateContext.Provider>
    </SearchActionsContext.Provider>
  );
}

export function useSearchActions() {
  const ctx = useContext(SearchActionsContext);
  if (!ctx) throw new Error("useSearchActions must be inside SearchProvider");
  return ctx;
}

export function useSearchUiState() {
  const ctx = useContext(SearchStateContext);
  if (!ctx) throw new Error("useSearchUiState must be inside SearchProvider");
  return ctx;
}

function RouteChangeCloser({ onChange }: { onChange: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    onChange();
  }, [pathname, searchParams, onChange]);

  return null;
}
