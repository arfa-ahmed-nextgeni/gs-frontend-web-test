import { Suspense } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import SortIcon from "@/assets/icons/sort-icon.svg";
import { CategoryMobileFilterActionSheet } from "@/components/category/filters/category-mobile-filter-action-sheet";
import { CategoryMobileFilterSkeleton } from "@/components/category/filters/category-mobile-filter-skeleton";
import { CategorySortDropdown } from "@/components/category/filters/category-sort-by-filter/category-sort-dropdown";
import { CategorySortDropdownSkeleton } from "@/components/category/filters/category-sort-by-filter/category-sort-dropdown-skeleton";
import Container from "@/components/shared/container";
import { SortStatusDropdownProvider } from "@/contexts/sort-status-dropdown-context";
import { CATEGORY_SORT_OPTIONS } from "@/lib/constants/category/category-sort";

export const CategorySortByFilter = ({ isMobile }: { isMobile?: boolean }) => {
  const t = useTranslations("category.sortDropdown");

  if (isMobile) {
    return (
      <Suspense
        fallback={
          <CategoryMobileFilterSkeleton
            icon={<Image alt="sort" src={SortIcon} />}
            label={t("dialog.shortTitle")}
          />
        }
      >
        <CategoryMobileFilterActionSheet
          dialogTitle={t("dialog.title")}
          icon={<Image alt="sort" src={SortIcon} />}
          label={t("dialog.shortTitle")}
          options={CATEGORY_SORT_OPTIONS}
          sectionId="sortBy"
          type="radio"
        />
      </Suspense>
    );
  }

  return (
    <Container className="mt-5 hidden w-full flex-col items-end lg:flex">
      <Suspense fallback={<CategorySortDropdownSkeleton />}>
        <SortStatusDropdownProvider>
          <CategorySortDropdown />
        </SortStatusDropdownProvider>
      </Suspense>
    </Container>
  );
};
