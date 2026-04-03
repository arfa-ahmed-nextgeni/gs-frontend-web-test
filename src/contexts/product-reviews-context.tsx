"use client";

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import { usePathname } from "@/i18n/navigation";

interface ProductReviewsContextValue {
  closeSortByFilter: VoidFunction;
  openSortByFilter: VoidFunction;
  showSortByFilter: boolean;
  toggleSortByFilter: VoidFunction;
}

export const ProductReviewsContext = createContext<
  ProductReviewsContextValue | undefined
>(undefined);

export function ProductReviewsProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();

  const [showSortByFilter, setShowSortByFilter] = useState(false);

  const toggleSortByFilter = () => {
    setShowSortByFilter((state) => !state);
  };

  const closeSortByFilter = () => {
    setShowSortByFilter(false);
  };

  const openSortByFilter = () => {
    setShowSortByFilter(true);
  };

  useEffect(() => {
    closeSortByFilter();
  }, [pathname]);

  return (
    <ProductReviewsContext.Provider
      value={{
        closeSortByFilter,
        openSortByFilter,
        showSortByFilter,
        toggleSortByFilter,
      }}
    >
      {children}
    </ProductReviewsContext.Provider>
  );
}

export function useProductReviews() {
  const context = useContext(ProductReviewsContext);
  if (!context) {
    throw new Error(
      "useProductReviews must be used within a ProductReviewsProvider"
    );
  }
  return context;
}
