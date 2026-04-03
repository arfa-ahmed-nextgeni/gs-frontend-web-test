"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

interface SortStatusDropdownContextType {
  isAnyDropdownOpen: boolean;
  isSortDropdownOpen: boolean;
  isStatusDropdownOpen: boolean;
  setSortDropdownOpen: (isOpen: boolean) => void;
  setStatusDropdownOpen: (isOpen: boolean) => void;
}

const SortStatusDropdownContext = createContext<
  SortStatusDropdownContextType | undefined
>(undefined);

export function SortStatusDropdownProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const setSortDropdownOpen = useCallback((isOpen: boolean) => {
    setIsSortDropdownOpen(isOpen);
  }, []);

  const setStatusDropdownOpen = useCallback((isOpen: boolean) => {
    setIsStatusDropdownOpen(isOpen);
  }, []);

  const isAnyDropdownOpen = isSortDropdownOpen || isStatusDropdownOpen;

  const value = {
    isAnyDropdownOpen,
    isSortDropdownOpen,
    isStatusDropdownOpen,
    setSortDropdownOpen,
    setStatusDropdownOpen,
  };

  return (
    <SortStatusDropdownContext.Provider value={value}>
      {children}
    </SortStatusDropdownContext.Provider>
  );
}

export function useSortStatusDropdown() {
  const context = useContext(SortStatusDropdownContext);
  if (context === undefined) {
    throw new Error(
      "useSortStatusDropdown must be used within a SortStatusDropdownProvider"
    );
  }
  return context;
}
