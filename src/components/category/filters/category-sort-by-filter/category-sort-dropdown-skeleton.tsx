import { useTranslations } from "next-intl";

import {
  getDefaultSortLabel,
  type ProductListingSortMode,
} from "@/lib/constants/category/category-sort";

interface CategorySortDropdownSkeletonProps {
  listingType?: ProductListingSortMode;
}

export function CategorySortDropdownSkeleton({
  listingType = "category",
}: CategorySortDropdownSkeletonProps) {
  const t = useTranslations("category.sortDropdown");
  const defaultSortLabel = getDefaultSortLabel(listingType);

  return (
    <div className="text-text-primary text-sm font-medium">
      {t("title")}{" "}
      <span className="text-text-tertiary">
        {t(`options.${defaultSortLabel}` as "options.relevance")}{" "}
        <span className="transition-default font-gilroy inline-block transition-transform">
          ↓
        </span>
      </span>
    </div>
  );
}
