import { useTranslations } from "next-intl";

export const CategoryTypeOptionSkeleton = ({
  labelKey,
}: {
  labelKey: string;
}) => {
  const t = useTranslations("category.categoryFilter.options");

  return (
    <div className="bg-bg-surface transition-default text-text-primary flex h-7 flex-shrink-0 animate-pulse items-center justify-center rounded-2xl px-2.5 text-xs font-normal">
      {t(labelKey as any)}
    </div>
  );
};
