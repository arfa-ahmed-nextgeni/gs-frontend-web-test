import { useTranslations } from "next-intl";

export const CategorySortDropdownSkeleton = () => {
  const t = useTranslations("category.sortDropdown");

  return (
    <div className="text-text-primary text-sm font-medium">
      {t("title")}{" "}
      <span className="text-text-tertiary">
        {t("options.relevance")}{" "}
        <span className="transition-default font-gilroy inline-block transition-transform">
          ↓
        </span>
      </span>
    </div>
  );
};
