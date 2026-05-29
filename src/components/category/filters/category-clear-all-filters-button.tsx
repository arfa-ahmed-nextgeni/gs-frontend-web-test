"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { useFilters } from "@/contexts/category-filter-context";
import { cn } from "@/lib/utils";

export const CategoryClearAllFiltersButton = () => {
  const t = useTranslations("category.filtersSection");
  const {
    clearAllFiltersExceptSearch,
    isDefaultSort,
    state: { checkboxes, priceMax, priceMin, sortBy },
  } = useFilters();

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const hasActiveFilters =
    isHydrated &&
    (Object.keys(checkboxes).some((key) => checkboxes[key]?.length > 0) ||
      priceMin !== null ||
      priceMax !== null ||
      (sortBy && !isDefaultSort(sortBy)));

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <button
      className={cn(
        "bg-bg-default rounded-4xl gap-1.25 px-3.75 relative flex h-7 flex-shrink-0 flex-row items-center justify-center lg:hidden"
      )}
      onClick={clearAllFiltersExceptSearch}
      type="button"
    >
      <span className="text-text-primary text-xs font-semibold">
        {t("clear")}
      </span>
    </button>
  );
};
