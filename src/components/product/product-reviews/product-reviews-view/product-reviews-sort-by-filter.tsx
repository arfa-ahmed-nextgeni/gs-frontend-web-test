"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";
import { parseAsStringLiteral, useQueryState } from "nuqs";

import CheckIcon from "@/assets/icons/check-icon.svg";
import { useProductReviews } from "@/contexts/product-reviews-context";
import { useIsMobile } from "@/hooks/use-is-mobile";
import {
  PRODUCT_REVIEWS_SORT_OPTIONS,
  ProductReviewsSortOption,
} from "@/lib/constants/product/product-reviews/sort-by";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { cn } from "@/lib/utils";

export const ProductReviewsSortByFilter = () => {
  const t = useTranslations("ProductReviewsPage.sortByFilters");

  const { closeSortByFilter, showSortByFilter } = useProductReviews();
  const isMobile = useIsMobile();
  const [isStickyHeader, setIsStickyHeader] = useState(false);

  const [sortBy, setSortBy] = useQueryState(
    QueryParamsKey.Sort,
    parseAsStringLiteral(PRODUCT_REVIEWS_SORT_OPTIONS).withOptions({
      scroll: isMobile,
      shallow: false,
    })
  );

  useEffect(() => {
    const header = document.querySelector<HTMLDivElement>(".site-header");

    if (!header) return;

    setIsStickyHeader(header.classList.contains("is-scrolling"));

    const observer = new MutationObserver(() => {
      setIsStickyHeader(header.classList.contains("is-scrolling"));
    });

    observer.observe(header, {
      attributeFilter: ["class"],
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  const handleSortChange = (option: ProductReviewsSortOption) => {
    setSortBy(option);
    closeSortByFilter();
  };

  if (!showSortByFilter) return null;

  return (
    <div
      className={cn("bg-bg-default flex flex-col", {
        "fixed top-[var(--mobile-header-height)] w-full":
          isStickyHeader && isMobile,
      })}
    >
      {PRODUCT_REVIEWS_SORT_OPTIONS.map((option) => {
        const isSelected = sortBy === option;

        return (
          <button
            className="h-7.5 flex flex-row items-center justify-center"
            key={option}
            onClick={() => handleSortChange(option)}
          >
            <div
              className={cn(
                "flex flex-row items-center justify-center gap-2.5",
                {
                  "-ms-5.5": isSelected,
                }
              )}
            >
              {isSelected && (
                <Image
                  alt=""
                  className="size-3"
                  height={12}
                  src={CheckIcon}
                  width={12}
                />
              )}
              <p className="text-text-primary text-sm font-medium">
                {t(option)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
