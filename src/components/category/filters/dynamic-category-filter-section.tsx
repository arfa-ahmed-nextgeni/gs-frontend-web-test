"use client";

import { useEffect, useMemo, useState } from "react";

import { CategoryCheckboxFilterSection } from "@/components/category/filters/category-checkbox-filter/category-checkbox-filter-section";
import { CategoryClearAllFiltersButton } from "@/components/category/filters/category-clear-all-filters-button";
import { CategoryPriceRangeFilter } from "@/components/category/filters/category-price-range-filter";
import { CategorySortByFilter } from "@/components/category/filters/category-sort-by-filter";
import { useFilters } from "@/contexts/category-filter-context";
import { useWindowScrollThreshold } from "@/hooks/use-window-scroll-threshold";
import { type DynamicCategoryFilter } from "@/lib/types/catalog-service";
import { cn } from "@/lib/utils";

interface DynamicCategoryFilterSectionProps {
  filters: DynamicCategoryFilter[];
  priceBounds?: { max: number; min: number };
}

export const DynamicCategoryFilterSection = ({
  filters,
  priceBounds,
}: DynamicCategoryFilterSectionProps) => {
  const hasScrolledPastStickyThreshold = useWindowScrollThreshold(200);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const showStickyFilters = hasScrolledPastStickyThreshold || isDrawerOpen;
  const {
    state: { checkboxes },
  } = useFilters();

  useEffect(() => {
    const handleDrawerChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ open?: boolean }>;
      setIsDrawerOpen(Boolean(customEvent.detail?.open));
    };

    window.addEventListener(
      "categoryFilterDrawerStateChange",
      handleDrawerChange
    );

    return () => {
      window.removeEventListener(
        "categoryFilterDrawerStateChange",
        handleDrawerChange
      );
    };
  }, []);

  const sortedFilters = useMemo(() => {
    const nonPriceFilters = filters.filter(
      (filter) => filter.attribute !== "price"
    );

    return nonPriceFilters.sort((a, b) => {
      const aHasSelection = checkboxes[a.id]?.length > 0;
      const bHasSelection = checkboxes[b.id]?.length > 0;

      if (aHasSelection === bHasSelection) return 0;

      return aHasSelection ? -1 : 1;
    });
  }, [filters, checkboxes]);

  return (
    <div
      className={cn(
        "gap-1.25 scrollbar-hidden overflow-x-auto lg:flex lg:flex-col",
        showStickyFilters ? "hidden lg:flex" : "flex flex-row"
      )}
    >
      <CategorySortByFilter isMobile />
      <CategoryPriceRangeFilter priceBounds={priceBounds} />
      {sortedFilters.map((filter) => (
        <CategoryCheckboxFilterSection
          defaultOpen={filter.defaultOpen}
          dialogTitle={filter.dialogTitle}
          id={filter.id}
          isSearchable={filter.isSearchable}
          key={filter.id}
          options={filter.options}
          shortTitle={filter.shortTitle}
          title={filter.title}
        />
      ))}
      <CategoryClearAllFiltersButton />
    </div>
  );
};
