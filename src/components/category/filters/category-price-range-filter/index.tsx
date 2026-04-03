import { Suspense } from "react";

import { useTranslations } from "next-intl";

import { CategoryFilterCollapsible } from "@/components/category/filters/category-filter-collapsible";
import { CategoryMobileFilterActionSheet } from "@/components/category/filters/category-mobile-filter-action-sheet";

export const CategoryPriceRangeFilter = ({
  priceBounds,
}: {
  priceBounds?: { max: number; min: number };
}) => {
  const t = useTranslations("category.filtersSection.priceRangeFilter");

  return (
    <>
      <Suspense fallback={null}>
        <CategoryMobileFilterActionSheet
          dialogTitle={t("dialogTitle")}
          label={t("title")}
          sectionId="price"
          type="price"
        />
      </Suspense>
      <CategoryFilterCollapsible
        defaultOpen={true}
        priceBounds={priceBounds}
        sectionId="price-range"
        title={t("title")}
        type="price"
      />
    </>
  );
};
