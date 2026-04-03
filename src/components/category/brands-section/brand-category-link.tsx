"use client";

import { MouseEvent } from "react";

import { useBrandsLetter } from "@/contexts/brands-letter-context";
import { useCategoryParam } from "@/hooks/brands/use-category-param";
import { Link } from "@/i18n/navigation";
import { NavigationItem } from "@/lib/models/site-navigation";
import { cn } from "@/lib/utils";

export const BrandCategoryLink = ({ id, label, path }: NavigationItem) => {
  const { categoryId, setCategoryId } = useCategoryParam();
  const { setSelectedLetter } = useBrandsLetter();

  const handleCategoryClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    setCategoryId(id);
    setSelectedLetter(null);
  };

  const isSelected = categoryId === id;

  return (
    <Link
      className={cn(
        "bg-bg-surface text-text-primary transition-default flex h-7 items-center justify-center rounded-xl px-2.5 text-xs font-normal",
        { "bg-bg-primary font-semibold text-white": isSelected },
        "shrink-0"
      )}
      href={path}
      key={id}
      onClick={handleCategoryClick}
    >
      {label}
    </Link>
  );
};
