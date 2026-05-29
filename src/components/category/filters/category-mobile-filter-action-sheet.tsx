"use client";

import { ReactNode, useEffect, useState } from "react";

import Image from "next/image";

import DownArrowIcon from "@/assets/icons/down-arrow-icon.svg";
import { FilterTracker } from "@/components/analytics/filter-tracker";
import { CategoryMobileFilterContent } from "@/components/category/filters/category-mobile-filter-content";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { useFilters } from "@/contexts/category-filter-context";

export const CategoryMobileFilterActionSheet = ({
  dialogTitle,
  icon,
  isSearchable,
  label,
  options,
  sectionId,
  type,
}: {
  dialogTitle: string;
  icon?: ReactNode;
  isSearchable?: boolean;
  label: string;
  options?: {
    count?: number;
    label: string;
    value: string;
  }[];
  sectionId: string;
  type: "checkbox" | "price" | "radio";
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("categoryFilterDrawerStateChange", {
        detail: { open: drawerOpen },
      })
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("categoryFilterDrawerStateChange", {
          detail: { open: false },
        })
      );
    };
  }, [drawerOpen]);

  const {
    isDefaultSort,
    state: { checkboxes, priceMax, priceMin, sortBy },
  } = useFilters();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const showIndicator =
    isHydrated &&
    (type === "radio"
      ? !isDefaultSort(sortBy)
      : type === "price"
        ? priceMin !== null || priceMax !== null
        : !!checkboxes[sectionId]?.length);

  return (
    <Drawer direction="bottom" onOpenChange={setDrawerOpen}>
      <FilterTracker isDrawerOpen={drawerOpen} />
      <DrawerTrigger asChild>
        <button
          className="bg-bg-default rounded-4xl gap-1.25 px-3.75 relative flex h-7 flex-shrink-0 flex-row items-center justify-center lg:hidden"
          type="button"
        >
          {icon}
          <span className="text-text-primary text-xs font-semibold">
            {label}
          </span>
          <Image
            alt="open"
            className="transition-default rotate-180"
            src={DownArrowIcon}
          />
          {showIndicator && (
            <div className="bg-text-danger absolute end-0 top-0 size-2.5 rounded-full" />
          )}
        </button>
      </DrawerTrigger>
      <CategoryMobileFilterContent
        dialogTitle={dialogTitle}
        drawerOpen={drawerOpen}
        isSearchable={isSearchable}
        options={options}
        sectionId={sectionId}
        type={type}
      />
    </Drawer>
  );
};
