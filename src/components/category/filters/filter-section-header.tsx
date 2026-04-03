import { Suspense } from "react";

import { useTranslations } from "next-intl";

import { ResetFiltersButton } from "@/components/category/filters/reset-filters-button";

export const FilterSectionHeader = () => {
  const t = useTranslations("category.filtersSection");

  return (
    <div className="bg-bg-default hidden h-7 flex-row items-center justify-between rounded-xl px-4 lg:flex">
      <div className="text-text-primary text-xs font-semibold">
        {t("filterBy")}
      </div>
      <Suspense
        fallback={
          <button className="text-text-brand text-xs font-normal" disabled>
            {t("clear")}
          </button>
        }
      >
        <ResetFiltersButton />
      </Suspense>
    </div>
  );
};
