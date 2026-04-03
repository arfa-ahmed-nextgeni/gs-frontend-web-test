"use client";

import { useEffect, useMemo, useState } from "react";

import { CategoryCheckboxFilterSection } from "@/components/category/filters/category-checkbox-filter/category-checkbox-filter-section";
import { CategoryClearAllFiltersButton } from "@/components/category/filters/category-clear-all-filters-button";
import { CategoryPriceRangeFilter } from "@/components/category/filters/category-price-range-filter";
import { CategorySortByFilter } from "@/components/category/filters/category-sort-by-filter";
import Container from "@/components/shared/container";
import { useFilters } from "@/contexts/category-filter-context";
import { useWindowScrollThreshold } from "@/hooks/use-window-scroll-threshold";
import { DynamicCategoryFilter } from "@/lib/types/catalog-service";

interface MobileStickyFiltersWrapperProps {
  dynamicFilters: DynamicCategoryFilter[];
  priceBounds?: { max: number; min: number };
}

export const MobileStickyFiltersWrapper = ({
  dynamicFilters,
  priceBounds,
}: MobileStickyFiltersWrapperProps) => {
  const hasScrolledPastStickyThreshold = useWindowScrollThreshold(200);
  const {
    state: { checkboxes },
  } = useFilters();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const sortedFilters = useMemo(() => {
    const nonPriceFilters = dynamicFilters.filter(
      (filter) => filter.attribute !== "price"
    );

    return nonPriceFilters.sort((a, b) => {
      const aHasSelection = checkboxes[a.id]?.length > 0;
      const bHasSelection = checkboxes[b.id]?.length > 0;
      if (aHasSelection === bHasSelection) return 0;

      return aHasSelection ? -1 : 1;
    });
  }, [dynamicFilters, checkboxes]);

  useEffect(() => {
    const handleDrawerChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsDrawerOpen(customEvent.detail?.open || false);
    };

    window.addEventListener("drawerStateChange", handleDrawerChange);

    return () => {
      window.removeEventListener("drawerStateChange", handleDrawerChange);
    };
  }, []);

  const showStickyFilters = hasScrolledPastStickyThreshold && !isDrawerOpen;

  return (
    <>
      {showStickyFilters && (
        <div className="fixed top-[var(--mobile-header-height)] z-50 w-full bg-white pb-1 pt-1 lg:hidden">
          <Container>
            <div className="gap-1.25 scrollbar-hidden flex flex-row overflow-x-auto">
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
          </Container>
        </div>
      )}
    </>
  );
};
