"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { useLocale } from "next-intl";

import { useSearchAutocomplete } from "@/hooks/product/use-search-client";
import { useRouter } from "@/i18n/navigation";
import {
  trackSearchFreetext,
  trackSearchRecent,
  trackSearchSuggestion,
} from "@/lib/analytics/events";
import { type Locale } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import { type ProductCardModel } from "@/lib/models/product-card-model";

type SearchState = {
  clear: () => void;
  clearRecentSearches: () => void;
  closeMobileSearch: () => void;
  closeStaticDesktopSearch: () => void;
  closeStickyDesktopSearch: () => void;
  facets: any[];
  handleAutoSearch: (e: React.FormEvent<HTMLInputElement>) => void;
  handleBrandClick: (brand: string) => void;
  handleRecentSearchClick: (searchTerm: string) => void;
  handleSearch: (e: React.SyntheticEvent) => void;
  handleSuggestionClick: (suggestion: string) => void;
  handleViewAll: () => void;
  isLoading: boolean;
  openMobileSearch: () => void;
  openStaticDesktopSearch: () => void;
  openStickyDesktopSearch: () => void;
  queryText: string;
  recentSearches: string[];
  relatedTerms: string[];
  searchResults?: ProductCardModel[];
  showMobileSearch: boolean;
  showStaticDesktopSearch: boolean;
  showStickyDesktopSearch: boolean;
  suggestions: string[];
  totalCount: number;
};

const SearchContext = createContext<null | SearchState>(null);

const RECENT_SEARCHES_KEY = "recentSearches";
const MAX_RECENT_SEARCHES = 5;

export function SearchContainer({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const locale = useLocale() as Locale;

  const [queryText, setQueryText] = useState("");
  const [showStaticDesktopSearch, setShowStaticDesktopSearch] = useState(false);
  const [showStickyDesktopSearch, setShowStickyDesktopSearch] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          setRecentSearches(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Error loading recent searches:", error);
      }
    }
  }, []);

  const { data: searchData, isLoading } = useSearchAutocomplete(
    { locale, text: queryText },
    showStaticDesktopSearch || showStickyDesktopSearch || showMobileSearch
  );
  const searchResults = searchData?.products;
  const totalCount = searchData?.totalCount || 0;

  const clear = () => {
    setQueryText("");
    setShowStaticDesktopSearch(false);
    setShowStickyDesktopSearch(false);
    setShowMobileSearch(false);
  };

  const addToRecentSearches = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    const trimmedTerm = searchTerm.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter((term) => term !== trimmedTerm);
      const updated = [trimmedTerm, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error("Error saving recent searches:", error);
        }
      }

      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(RECENT_SEARCHES_KEY);
      } catch (error) {
        console.error("Error clearing recent searches:", error);
      }
    }
  };

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault();
    // Track search_freetext when search is submitted
    trackSearchFreetext(queryText);
    addToRecentSearches(queryText);
    clear();
    const route = `${ROUTES.SEARCH}?q=${encodeURIComponent(queryText)}`;
    router.push(route);
  };

  const handleViewAll = () => {
    addToRecentSearches(queryText);
    clear();
    const route = `${ROUTES.SEARCH}?q=${encodeURIComponent(queryText)}`;
    router.push(route);
  };

  const handleBrandClick = (brand: string) => {
    addToRecentSearches(brand);
    clear();
    const route = `${ROUTES.SEARCH}?q=${encodeURIComponent(brand)}`;
    router.push(route);
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setQueryText(searchTerm);
    // Track search_recent when an item in search history is selected
    trackSearchRecent(searchTerm);
  };

  const handleSuggestionClick = (suggestion: string) => {
    addToRecentSearches(suggestion);
    clear();
    // Track search_suggestion when an item in search suggestion is selected
    trackSearchSuggestion(suggestion, queryText);
    const route = `${ROUTES.SEARCH}?q=${encodeURIComponent(suggestion)}`;
    router.replace(route);
  };

  const handleAutoSearch = (e: React.FormEvent<HTMLInputElement>) => {
    setQueryText(e.currentTarget.value);
  };

  const openMobileSearch = () => {
    setShowMobileSearch(true);
    setShowStaticDesktopSearch(false);
    setShowStickyDesktopSearch(false);
  };

  const closeMobileSearch = () => {
    clear();
  };

  const openStaticDesktopSearch = () => {
    setShowStaticDesktopSearch(true);
    setShowStickyDesktopSearch(false);
    setShowMobileSearch(false);
  };

  const openStickyDesktopSearch = () => {
    setShowStickyDesktopSearch(true);
    setShowStaticDesktopSearch(false);
    setShowMobileSearch(false);
  };

  const closeStaticDesktopSearch = () => {
    setShowStaticDesktopSearch(false);
  };

  const closeStickyDesktopSearch = () => {
    setShowStickyDesktopSearch(false);
  };

  return (
    <SearchContext.Provider
      value={{
        clear,
        clearRecentSearches,
        closeMobileSearch,
        closeStaticDesktopSearch,
        closeStickyDesktopSearch,
        facets: searchData?.facets || [],
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
        relatedTerms: searchData?.relatedTerms || [],
        searchResults,
        showMobileSearch,
        showStaticDesktopSearch,
        showStickyDesktopSearch,
        suggestions: searchData?.suggestions || [],
        totalCount: totalCount,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be inside SearchProvider");
  return ctx;
}
