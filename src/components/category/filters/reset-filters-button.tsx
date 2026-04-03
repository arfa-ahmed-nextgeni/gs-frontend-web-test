"use client";

import { useTranslations } from "next-intl";

import { useFilters } from "@/contexts/category-filter-context";

export const ResetFiltersButton = () => {
  const t = useTranslations("category.filtersSection");

  const { resetToDefaults, state } = useFilters();

  const hasAppliedFilters = () => {
    const hasCheckboxes = Object.values(state.checkboxes).some(
      (values) => values && values.length > 0
    );

    const hasPriceFilter = state.priceMin !== null || state.priceMax !== null;

    const hasSortFilter = state.sortBy !== undefined;

    return hasCheckboxes || hasPriceFilter || hasSortFilter;
  };

  if (!hasAppliedFilters()) {
    return null;
  }

  return (
    <button
      className="text-text-brand text-xs font-normal"
      onClick={resetToDefaults}
    >
      {t("clear")}
    </button>
  );
};
