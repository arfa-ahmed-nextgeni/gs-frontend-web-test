"use client";

import { useMemo } from "react";

import { useTranslations } from "next-intl";

import { CategoryCheckboxFilterSection } from "@/components/category/filters/category-checkbox-filter/category-checkbox-filter-section";
import { CategoryClearAllFiltersButton } from "@/components/category/filters/category-clear-all-filters-button";
import { CategoryPriceRangeFilter } from "@/components/category/filters/category-price-range-filter";
import { CategorySortByFilter } from "@/components/category/filters/category-sort-by-filter";
import { CategoryTypeFilter } from "@/components/category/filters/category-type-filter";
import { FilterSectionHeader } from "@/components/category/filters/filter-section-header";
import { useFilters } from "@/contexts/category-filter-context";
import { type DynamicCategoryFilter } from "@/lib/types/catalog-service";
import { type CategoryBreadcrumb } from "@/lib/types/category-route-data";

interface CategoryInfo {
  children_count?: number;
  include_in_menu?: boolean;
  level?: number;
  name: string;
  product_count?: number;
  uid: string;
  url_key: string;
  url_path?: string;
}

interface DynamicCategoryFilterSectionProps {
  breadcrumbs?: CategoryBreadcrumb[];
  categoryChildren?: CategoryInfo[];
  currentCategory?: CategoryInfo;
  filters: DynamicCategoryFilter[];
  priceBounds?: { max: number; min: number };
}

export const DynamicCategoryFilterSection = ({
  breadcrumbs,
  categoryChildren,
  currentCategory,
  filters,
  priceBounds,
}: DynamicCategoryFilterSectionProps) => {
  const t = useTranslations("category");
  const {
    state: { checkboxes },
  } = useFilters();
  const parentCategories = useMemo(() => {
    // breadcrumbs always include Home + current category; parent exists only when length > 2.
    if (!Array.isArray(breadcrumbs) || breadcrumbs.length <= 2) {
      return [];
    }

    const parentHref = breadcrumbs.at(-2)?.href || "";
    const parentPath = parentHref
      .replace(/^\/c\//, "")
      .replace(/^\/+|\/+$/g, "");

    if (!parentPath) {
      return [];
    }

    const parentPathSegments = parentPath.split("/").filter(Boolean);
    const parentUrlKey = parentPathSegments.at(-1) || parentPath;

    return [
      {
        name: t("previous"),
        product_count: undefined,
        uid: `parent-${parentPath}`,
        url_key: parentUrlKey,
        url_path: parentPath,
      },
    ];
  }, [breadcrumbs, t]);

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
    <div className="gap-1.25 lg:mt-15 flex w-full flex-col lg:w-[191px]">
      {currentCategory && (
        <CategoryTypeFilter
          currentCategory={currentCategory}
          parentCategories={parentCategories}
        >
          {categoryChildren}
        </CategoryTypeFilter>
      )}
      <FilterSectionHeader />
      <div className="gap-1.25 scrollbar-hidden flex flex-row overflow-x-auto lg:flex-col">
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
    </div>
  );
};
