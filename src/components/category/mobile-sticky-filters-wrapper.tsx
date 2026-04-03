"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CategoryCheckboxFilterSection } from "@/components/category/filters/category-checkbox-filter/category-checkbox-filter-section";
import { CategoryClearAllFiltersButton } from "@/components/category/filters/category-clear-all-filters-button";
import { CategoryPriceRangeFilter } from "@/components/category/filters/category-price-range-filter";
import { CategorySortByFilter } from "@/components/category/filters/category-sort-by-filter";
import Container from "@/components/shared/container";
import { useFilters } from "@/contexts/category-filter-context";
import { DynamicCategoryFilter } from "@/lib/types/catalog-service";

interface MobileStickyFiltersWrapperProps {
  dynamicFilters: DynamicCategoryFilter[];
  priceBounds?: { max: number; min: number };
}

export const MobileStickyFiltersWrapper = ({
  dynamicFilters,
  priceBounds,
}: MobileStickyFiltersWrapperProps) => {
  const {
    state: { checkboxes },
  } = useFilters();

  const [showStickyFilters, setShowStickyFilters] = useState(false);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollYRef = useRef(0);
  const isDrawerOpenRef = useRef(false);

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

  const throttledScrollHandler = useCallback(() => {
    if (throttleTimeoutRef.current) {
      return;
    }

    throttleTimeoutRef.current = setTimeout(() => {
      if (isDrawerOpenRef.current) {
        throttleTimeoutRef.current = null;
        return;
      }

      const scrollY = window.scrollY;
      const threshold = 200;

      const shouldShow = scrollY > threshold;
      const wasShowing = lastScrollYRef.current > threshold;

      if (shouldShow !== wasShowing) {
        setShowStickyFilters(shouldShow);
      }

      lastScrollYRef.current = scrollY;
      throttleTimeoutRef.current = null;
    }, 16);
  }, []);

  useEffect(() => {
    const handleDrawerChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      isDrawerOpenRef.current = customEvent.detail?.open || false;
    };

    window.addEventListener("scroll", throttledScrollHandler, {
      passive: true,
    });
    window.addEventListener("drawerStateChange", handleDrawerChange);

    return () => {
      window.removeEventListener("scroll", throttledScrollHandler);
      window.removeEventListener("drawerStateChange", handleDrawerChange);
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [throttledScrollHandler]);

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
