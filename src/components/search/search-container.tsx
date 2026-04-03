"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { saveRecentSearch } from "@/components/search/utils/search-storage";
import { useRouter } from "@/i18n/navigation";
import {
  trackSearchFreetext,
  trackSearchRecent,
  trackSearchSuggestion,
} from "@/lib/analytics/events";
import { ROUTES } from "@/lib/constants/routes";

type SearchActions = {
  clear: () => void;
  closeMobileSearch: () => void;
  closeStaticDesktopSearch: () => void;
  closeStickyDesktopSearch: () => void;
  handleAutoSearch: (e: React.FormEvent<HTMLInputElement>) => void;
  handleBrandClick: (brand: string) => void;
  handleRecentSearchClick: (searchTerm: string) => void;
  handleSearch: (e: React.SyntheticEvent) => void;
  handleSuggestionClick: (suggestion: string) => void;
  handleViewAll: () => void;
  openMobileSearch: () => void;
  openStaticDesktopSearch: () => void;
  openStickyDesktopSearch: () => void;
  setHasDropdownContent: (hasContent: boolean) => void;
};

type SearchState = {
  hasDropdownContent: boolean;
  queryText: string;
  showMobileSearch: boolean;
  showStaticDesktopSearch: boolean;
  showStickyDesktopSearch: boolean;
};

const SearchActionsContext = createContext<null | SearchActions>(null);
const SearchStateContext = createContext<null | SearchState>(null);

export function SearchContainer({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [queryText, setQueryText] = useState("");
  const [hasDropdownContent, setHasDropdownContent] = useState(false);
  const [showStaticDesktopSearch, setShowStaticDesktopSearch] = useState(false);
  const [showStickyDesktopSearch, setShowStickyDesktopSearch] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const queryTextRef = useRef(queryText);

  queryTextRef.current = queryText;

  const clear = useCallback(() => {
    setQueryText("");
    setHasDropdownContent(false);
    setShowStaticDesktopSearch(false);
    setShowStickyDesktopSearch(false);
    setShowMobileSearch(false);
  }, []);

  const handleSearch = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      const currentQueryText = queryTextRef.current;
      // Track search_freetext when search is submitted
      trackSearchFreetext(currentQueryText);
      saveRecentSearch(currentQueryText);
      clear();
      const route = `${ROUTES.SEARCH}?q=${encodeURIComponent(currentQueryText)}`;
      router.push(route);
    },
    [clear, router]
  );

  const handleViewAll = useCallback(() => {
    const currentQueryText = queryTextRef.current;

    saveRecentSearch(currentQueryText);
    clear();
    const route = `${ROUTES.SEARCH}?q=${encodeURIComponent(currentQueryText)}`;
    router.push(route);
  }, [clear, router]);

  const handleBrandClick = useCallback(
    (brand: string) => {
      saveRecentSearch(brand);
      clear();
      const route = `${ROUTES.SEARCH}?q=${encodeURIComponent(brand)}`;
      router.push(route);
    },
    [clear, router]
  );

  const handleRecentSearchClick = useCallback((searchTerm: string) => {
    setQueryText(searchTerm);
    // Track search_recent when an item in search history is selected
    trackSearchRecent(searchTerm);
  }, []);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      saveRecentSearch(suggestion);
      clear();
      // Track search_suggestion when an item in search suggestion is selected
      trackSearchSuggestion(suggestion, queryTextRef.current);
      const route = `${ROUTES.SEARCH}?q=${encodeURIComponent(suggestion)}`;
      router.replace(route);
    },
    [clear, router]
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
      closeStaticDesktopSearch,
      closeStickyDesktopSearch,
      handleAutoSearch,
      handleBrandClick,
      handleRecentSearchClick,
      handleSearch,
      handleSuggestionClick,
      handleViewAll,
      openMobileSearch,
      openStaticDesktopSearch,
      openStickyDesktopSearch,
      setHasDropdownContent,
    }),
    [
      clear,
      closeMobileSearch,
      closeStaticDesktopSearch,
      closeStickyDesktopSearch,
      handleAutoSearch,
      handleBrandClick,
      handleRecentSearchClick,
      handleSearch,
      handleSuggestionClick,
      handleViewAll,
      openMobileSearch,
      openStaticDesktopSearch,
      openStickyDesktopSearch,
      setHasDropdownContent,
    ]
  );

  const searchStateValue = useMemo(
    () => ({
      hasDropdownContent,
      queryText,
      showMobileSearch,
      showStaticDesktopSearch,
      showStickyDesktopSearch,
    }),
    [
      hasDropdownContent,
      queryText,
      showMobileSearch,
      showStaticDesktopSearch,
      showStickyDesktopSearch,
    ]
  );

  return (
    <SearchActionsContext.Provider value={searchActionsValue}>
      <SearchStateContext.Provider value={searchStateValue}>
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
