import { Suspense } from "react";

import { CategoryFilterCollapsible } from "@/components/category/filters/category-filter-collapsible";
import { CategoryMobileFilterActionSheet } from "@/components/category/filters/category-mobile-filter-action-sheet";

export const CategoryCheckboxFilterSection = ({
  defaultOpen,
  id,
  isSearchable,
  options,
  title,
}: {
  defaultOpen?: boolean;
  dialogTitle: string;
  id: string;
  isSearchable?: boolean;
  options: {
    count: number;
    label: string;
    value: string;
  }[];
  shortTitle: string;
  title: string;
}) => {
  return (
    <>
      <Suspense fallback={null}>
        <CategoryMobileFilterActionSheet
          dialogTitle={title}
          isSearchable={isSearchable}
          label={title}
          options={options}
          sectionId={id}
          type="checkbox"
        />
      </Suspense>
      <CategoryFilterCollapsible
        defaultOpen={defaultOpen}
        isSearchable={isSearchable}
        options={options}
        sectionId={id}
        title={title}
        type="checkbox"
      />
    </>
  );
};
