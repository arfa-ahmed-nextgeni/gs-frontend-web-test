"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import Image from "next/image";

import { CheckedState } from "@radix-ui/react-checkbox";
import { useTranslations } from "next-intl";

import ClearIcon from "@/assets/icons/clear-icon.svg";
import DownArrowIcon from "@/assets/icons/down-arrow-icon.svg";
import SearchIcon from "@/assets/icons/search-icon.svg";
import { FilterTracker } from "@/components/analytics/filter-tracker";
import { CategoryCheckboxFilterListSkeleton } from "@/components/category/filters/category-checkbox-filter/category-checkbox-filter-list-skeleton";
import { CategoryPriceInput } from "@/components/category/filters/category-price-range-filter/category-price-input";
import { CategoryPriceInputSkeleton } from "@/components/category/filters/category-price-range-filter/category-price-input-skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFilters } from "@/contexts/category-filter-context";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

export const CategoryFilterCollapsible = ({
  defaultOpen,
  isSearchable,
  options = [],
  sectionId,
  title,
  type,
}: {
  defaultOpen?: boolean;
  isSearchable?: boolean;
  options?: {
    count: number;
    label: string;
    value: string;
  }[];
  priceBounds?: { max: number; min: number };
  sectionId: string;
  title: string;
  type: "checkbox" | "price";
}) => {
  const t = useTranslations("category.filtersSection");
  const tPrice = useTranslations("category.filtersSection.priceRangeFilter");

  const isMobile = useIsMobile();

  const {
    setCheckboxesForSection,
    setPrice,
    state: { checkboxes, priceMax, priceMin },
  } = useFilters();

  const [checkedFilters, setCheckedFilters] = useState<string[]>([]);

  useEffect(() => {
    const filters = checkboxes[sectionId] ? checkboxes[sectionId] : [];
    setCheckedFilters(filters);
  }, [checkboxes, sectionId]);

  const [searchQuery, setSearchQuery] = useState("");

  const [priceValidation, setPriceValidation] = useState({
    errorMessage: "",
    maxError: false,
    minError: false,
  });

  const [localPriceMin, setLocalPriceMin] = useState<null | number>(
    priceMin ?? null
  );
  const [localPriceMax, setLocalPriceMax] = useState<null | number>(
    priceMax ?? null
  );

  const localPriceMinRef = useRef<null | number>(priceMin ?? null);
  const localPriceMaxRef = useRef<null | number>(priceMax ?? null);
  const priceMinRef = useRef<null | number>(priceMin ?? null);
  const priceMaxRef = useRef<null | number>(priceMax ?? null);

  useEffect(() => {
    setLocalPriceMin(priceMin ?? null);
    setLocalPriceMax(priceMax ?? null);
    if (priceMin === null && priceMax === null) {
      setPriceValidation({
        errorMessage: "",
        maxError: false,
        minError: false,
      });
    }
  }, [priceMin, priceMax]);

  useEffect(() => {
    localPriceMinRef.current = localPriceMin;
    localPriceMaxRef.current = localPriceMax;
    priceMinRef.current = priceMin ?? null;
    priceMaxRef.current = priceMax ?? null;
  }, [localPriceMin, localPriceMax, priceMin, priceMax]);

  const validateAndApplyPrice = useCallback(() => {
    setPriceValidation({
      errorMessage: "",
      maxError: false,
      minError: false,
    });

    const currentLocalPriceMin = localPriceMinRef.current;
    const currentLocalPriceMax = localPriceMaxRef.current;
    const currentPriceMin = priceMinRef.current;
    const currentPriceMax = priceMaxRef.current;

    if (currentLocalPriceMax !== null && currentLocalPriceMin === null) {
      setPriceValidation({
        errorMessage: tPrice("errors.minRequired") || "Please enter min value",
        maxError: false,
        minError: true,
      });
      return;
    }

    if (currentLocalPriceMin !== null && currentLocalPriceMax === null) {
      setPriceValidation({
        errorMessage: tPrice("errors.maxRequired") || "Please enter max value",
        maxError: true,
        minError: false,
      });
      return;
    }

    if (
      currentLocalPriceMax !== null &&
      currentLocalPriceMin !== null &&
      currentLocalPriceMax < currentLocalPriceMin
    ) {
      setPriceValidation({
        errorMessage:
          tPrice("errors.maxSmallerThanMin") || "Max value is smaller than min",
        maxError: true,
        minError: false,
      });
      return;
    }

    if (
      currentLocalPriceMin !== currentPriceMin ||
      currentLocalPriceMax !== currentPriceMax
    ) {
      setPrice(currentLocalPriceMin, currentLocalPriceMax);
    }
  }, [setPrice, tPrice]);

  const handleMinPriceChange = (price: null | number) => {
    setLocalPriceMin(price);
    localPriceMinRef.current = price;
    validateAndApplyPrice();
  };

  const handleMaxPriceChange = (price: null | number) => {
    setLocalPriceMax(price);
    localPriceMaxRef.current = price;
    validateAndApplyPrice();
  };

  const handleMinBlur = () => {
    validateAndApplyPrice();
  };

  const handleMaxBlur = () => {
    validateAndApplyPrice();
  };

  const handleFilterToggle = (value: string, isChecked: CheckedState) => {
    const currentFilters = Array.isArray(checkedFilters) ? checkedFilters : [];

    const updatedFilters = isChecked
      ? [...currentFilters, value]
      : currentFilters.filter((filter) => filter !== value);

    setCheckedFilters(updatedFilters);
    setCheckboxesForSection(sectionId, updatedFilters);
  };

  const filteredOptions =
    options
      ?.filter(({ label }) =>
        label.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const aIsChecked = checkedFilters?.includes(a.value);
        const bIsChecked = checkedFilters?.includes(b.value);

        if (aIsChecked === bIsChecked) return 0;
        return aIsChecked ? -1 : 1;
      }) || [];

  const renderContent = () => {
    switch (type) {
      case "checkbox":
        return (
          <>
            {isSearchable && (
              <div className="relative">
                <span className="ps-3.75 absolute inset-y-0 start-0 flex items-center">
                  <Image
                    alt="search"
                    className="rtl:rotate-90"
                    src={SearchIcon}
                  />
                </span>
                <input
                  className="bg-bg-surface focus:border-border-primary focus:bg-bg-body text-text-primary focus:outline-border-primary placeholder:text-text-placeholder block w-full rounded-2xl border-none py-1.5 pe-7 ps-10 text-xs font-normal [appearance:textfield] focus:outline-[0.5px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchInputPlaceholder")}
                  value={searchQuery}
                />
                {searchQuery.length > 0 && (
                  <button
                    className="transition-default pe-3.75 absolute end-0 top-0 flex h-full items-center justify-center"
                    onClick={() => setSearchQuery("")}
                    title="Clear search"
                    type="button"
                  >
                    <Image alt="clear" src={ClearIcon} />
                  </button>
                )}
              </div>
            )}
            <ScrollArea
              className={cn(
                "max-h-45 pt-2",
                filteredOptions.length > 6 && "h-45"
              )}
            >
              <div className="flex flex-col">
                <Suspense
                  fallback={
                    <CategoryCheckboxFilterListSkeleton options={options} />
                  }
                >
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => {
                      const optionId = `desktop-${sectionId}-${option.value}`;

                      return (
                        <div
                          className="flex transform items-center gap-2.5 rounded-md px-1 py-1.5 transition-all duration-200 ease-in-out hover:bg-gray-50"
                          key={optionId}
                        >
                          <Checkbox
                            checked={checkedFilters?.includes(option.value)}
                            className="peer"
                            id={optionId}
                            onCheckedChange={(checked) =>
                              handleFilterToggle(option.value, checked)
                            }
                            value={option.value}
                          />
                          <Label
                            className="text-text-primary peer-data-[state=checked]:text-primary block text-xs font-normal transition-all duration-200 ease-in-out peer-data-[state=checked]:font-semibold"
                            htmlFor={optionId}
                          >
                            {option.label}{" "}
                            <span className="text-text-tertiary text-[8px] font-normal">
                              ({option.count})
                            </span>
                          </Label>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-text-primary py-1.5 text-sm font-normal">
                      {t("noResultsFor")}{" "}
                      <span className="underline">{searchQuery}</span>
                    </div>
                  )}
                </Suspense>
              </div>
            </ScrollArea>
          </>
        );

      case "price":
        return (
          <>
            <div className="mt-1.5 flex flex-col gap-1">
              <div className="flex flex-row justify-between">
                <Suspense
                  fallback={
                    <>
                      <CategoryPriceInputSkeleton type="min" />
                      <CategoryPriceInputSkeleton type="max" />
                    </>
                  }
                >
                  <CategoryPriceInput
                    hasError={priceValidation.minError}
                    onBlur={handleMinBlur}
                    onPriceChange={handleMinPriceChange}
                    type="min"
                    value={localPriceMin}
                  />
                  <CategoryPriceInput
                    hasError={priceValidation.maxError}
                    onBlur={handleMaxBlur}
                    onPriceChange={handleMaxPriceChange}
                    type="max"
                    value={localPriceMax}
                  />
                </Suspense>
              </div>
              {(priceValidation.minError || priceValidation.maxError) && (
                <div className="flex flex-row justify-between gap-1">
                  {priceValidation.minError && (
                    <span className="text-[9px] text-red-500">
                      {priceValidation.errorMessage}
                    </span>
                  )}
                  {priceValidation.maxError && (
                    <span className="text-[9px] text-red-500">
                      {priceValidation.errorMessage}
                    </span>
                  )}
                </div>
              )}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);

  return (
    <Collapsible
      className="bg-bg-default hidden rounded-xl lg:block"
      defaultOpen={defaultOpen}
      onOpenChange={setIsOpen}
    >
      <FilterTracker isCollapsibleOpen={isOpen && !isMobile} />
      <CollapsibleTrigger className="group flex h-7 w-full flex-row items-center justify-between px-4">
        <div className="text-text-primary text-xs font-semibold">{title}</div>
        <Image
          alt="arrow icon"
          className="transition-default group-data-[state=open]:rotate-180"
          src={DownArrowIcon}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-border-base flex flex-col gap-1 overflow-hidden border-t px-4 py-0 data-[state=open]:py-2.5">
        {renderContent()}
      </CollapsibleContent>
    </Collapsible>
  );
};
