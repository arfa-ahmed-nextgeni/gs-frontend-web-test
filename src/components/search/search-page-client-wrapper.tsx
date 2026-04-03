"use client";

import { type ReactNode } from "react";

import { FilterProvider } from "@/contexts/category-filter-context";

interface SearchPageClientWrapperProps {
  children: ReactNode;
}

export function SearchPageClientWrapper({
  children,
}: SearchPageClientWrapperProps) {
  return <FilterProvider>{children}</FilterProvider>;
}
