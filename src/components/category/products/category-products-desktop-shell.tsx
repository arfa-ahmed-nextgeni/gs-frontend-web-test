"use client";

import { type ReactNode } from "react";

import { CategoryProductsPagination } from "@/components/category/products/category-products-pagination";
import { ProductGridSkeleton } from "@/components/category/skeletons/product-grid-skeleton";
import { useFilters } from "@/contexts/category-filter-context";
import {
  PaginationProvider,
  usePagination,
} from "@/contexts/pagination-context";

interface CategoryProductsDesktopShellProps {
  children: ReactNode;
  totalPages: number;
}

export function CategoryProductsDesktopShell({
  children,
  totalPages,
}: CategoryProductsDesktopShellProps) {
  return (
    <PaginationProvider
      queryOptions={{
        scroll: true,
      }}
    >
      <CategoryProductsDesktopShellContent totalPages={totalPages}>
        {children}
      </CategoryProductsDesktopShellContent>
    </PaginationProvider>
  );
}

function CategoryProductsDesktopShellContent({
  children,
  totalPages,
}: CategoryProductsDesktopShellProps) {
  const { isLoading: isPageLoading } = usePagination();
  const { isNavigationPending } = useFilters();
  const isLoading = isNavigationPending || isPageLoading;

  return (
    <div className="flex flex-col gap-8">
      {isLoading ? <ProductGridSkeleton count={20} /> : children}
      <CategoryProductsPagination
        totalPages={totalPages}
        withProvider={false}
      />
    </div>
  );
}
