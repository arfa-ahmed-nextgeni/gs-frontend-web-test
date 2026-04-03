"use client";

import { useState } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import CheckIcon from "@/assets/icons/check-icon.svg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useFilters } from "@/contexts/category-filter-context";
import { useSortStatusDropdown } from "@/contexts/sort-status-dropdown-context";
import { CATEGORY_SORT_OPTIONS } from "@/lib/constants/category/category-sort";
import { cn } from "@/lib/utils";

export const CategorySortDropdown = () => {
  const t = useTranslations("category.sortDropdown");

  const {
    setSort,
    state: { sortBy },
  } = useFilters();

  const { setSortDropdownOpen } = useSortStatusDropdown();
  const [selectOpenStatus, setSelectOpenStatus] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setSelectOpenStatus(open);
    setSortDropdownOpen(open);
  };

  const getSortLabel = (sortValue: string | undefined) => {
    if (!sortValue) return "relevance";
    const option = CATEGORY_SORT_OPTIONS.find((opt) => opt.value === sortValue);
    return option?.label || "relevance";
  };

  return (
    <Select
      onOpenChange={handleOpenChange}
      onValueChange={(value) => {
        setSort(value);
      }}
      value={sortBy ?? undefined}
    >
      <SelectTrigger className="!h-auto border-none bg-transparent p-0 shadow-none focus-visible:border-none focus-visible:ring-0">
        <div className="text-text-primary text-sm font-medium">
          {t("title")}
          {": "}
          <span className="text-text-tertiary">
            {t(`options.${getSortLabel(sortBy)}` as any)}{" "}
            <span
              className={cn(
                "transition-default font-gilroy inline-block transition-transform",
                { "rotate-180": selectOpenStatus }
              )}
            >
              ↓
            </span>
          </span>
        </div>
      </SelectTrigger>
      <SelectContent
        align="end"
        className="bg-bg-default group/list top-4 w-[190px] rounded-b-xl rounded-t-none border-none"
        viewportProps={{
          className: "p-0",
        }}
      >
        {CATEGORY_SORT_OPTIONS.map(({ label, value }) => {
          const isSelected = sortBy === value;

          return (
            <SelectItem
              className="transition-default hover:bg-bg-surface text-text-primary ps-7.5 border-border-base group/option gap-2.5 border-b py-2 text-sm font-medium last:border-none"
              key={value}
              value={value}
            >
              <Image
                alt="check-icon"
                className={cn("transition-default hidden", {
                  block: isSelected,
                })}
                src={CheckIcon}
                unoptimized
              />
              <span>{t(`options.${label}` as any)}</span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
