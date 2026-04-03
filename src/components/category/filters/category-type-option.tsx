"use client";

import { useTranslations } from "next-intl";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

import { trackToggleCategory } from "@/lib/analytics/events";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { cn } from "@/lib/utils";

export const CategoryTypeOption = ({
  id,
  labelKey,
}: {
  id: string;
  labelKey: string;
}) => {
  const t = useTranslations("category.categoryFilter.options");

  const [selectedCategoryIds, setSelectedCategoryIds] = useQueryState(
    QueryParamsKey.CategoryId,
    parseAsArrayOf(parseAsString, ",").withDefault([])
  );

  const handleCategoryToggle = () => {
    const currentFilters = Array.isArray(selectedCategoryIds)
      ? selectedCategoryIds
      : [];

    const updatedCategoryIds = !selectedCategoryIds.includes(id)
      ? [...currentFilters, id]
      : currentFilters.filter((filter) => filter !== id);

    // Track toggle_category when user clicks on the toggle button in home page to change the home page
    trackToggleCategory(id);
    setSelectedCategoryIds(updatedCategoryIds);
  };

  return (
    <button
      className={cn(
        "bg-bg-surface text-text-primary flex h-7 flex-shrink-0 items-center justify-center rounded-2xl px-2.5 text-xs font-normal transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm",
        {
          "bg-bg-primary text-text-inverse scale-105 font-semibold shadow-sm":
            selectedCategoryIds.includes(id),
        }
      )}
      key={id}
      onClick={handleCategoryToggle}
    >
      {t(labelKey as any)}
    </button>
  );
};
