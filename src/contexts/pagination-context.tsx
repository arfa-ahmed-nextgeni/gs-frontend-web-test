"use client";

import React, { createContext, useContext } from "react";

import { Options } from "nuqs";

import { useIsMobile } from "@/hooks/use-is-mobile";
import { usePageQuery } from "@/hooks/use-page-query";

interface PaginationContextType {
  currentPage: number;
  isLoading: boolean;
  setCurrentPage: (page: number) => void;
}

const PaginationContext = createContext<PaginationContextType | undefined>(
  undefined
);

export const PaginationProvider = ({
  children,
  mobileScroll,
  queryOptions,
}: {
  children: React.ReactNode;
  mobileScroll?: boolean;
  queryOptions?: Options;
}) => {
  const isMobile = useIsMobile();

  const { currentPage, isLoading, setCurrentPage } = usePageQuery({
    ...queryOptions,
    scroll: mobileScroll ? isMobile : queryOptions?.scroll,
  });

  return (
    <PaginationContext.Provider
      value={{
        currentPage,
        isLoading,
        setCurrentPage,
      }}
    >
      {children}
    </PaginationContext.Provider>
  );
};

export const usePagination = () => {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error("usePagination must be used within PaginationProvider");
  }
  return context;
};
