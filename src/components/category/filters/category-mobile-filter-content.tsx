"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import Image from "next/image";

import { CheckedState } from "@radix-ui/react-checkbox";
import { useTranslations } from "next-intl";

import ClearIcon from "@/assets/icons/clear-icon.svg";
import DownArrowIcon from "@/assets/icons/down-arrow-icon.svg";
import SearchIcon from "@/assets/icons/search-icon.svg";
import { CategoryPriceInput } from "@/components/category/filters/category-price-range-filter/category-price-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFilters } from "@/contexts/category-filter-context";
import { useVisualViewport } from "@/hooks/use-visual-viewport";
import { CategorySortKey } from "@/lib/constants/category/category-sort";
import { cn } from "@/lib/utils";
import { arraysEqual } from "@/lib/utils/array";

export const CategoryMobileFilterContent = ({
  dialogTitle,
  drawerOpen,
  isSearchable,
  options,
  sectionId,
  type,
}: {
  dialogTitle: string;
  drawerOpen: boolean;
  isSearchable?: boolean;
  options?: {
    count?: number;
    label: string;
    value: string;
  }[];
  sectionId: string;
  type: "checkbox" | "price" | "radio";
}) => {
  const t = useTranslations("category.filtersSection");
  const tSort = useTranslations("category.sortDropdown");
  const tPrice = useTranslations("category.filtersSection.priceRangeFilter");

  const {
    isNavigationPending,
    setCheckboxesForSection,
    setPrice,
    setSort,
    state: { checkboxes, priceMax, priceMin, sortBy },
  } = useFilters();

  const sectionCheckboxes = useMemo(
    () => (checkboxes[sectionId] ? checkboxes[sectionId] : []),
    [checkboxes, sectionId]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, startSubmitting] = useTransition();
  const [priceMinState, setPriceMinState] = useState<null | number>(
    priceMin ?? null
  );
  const [priceMaxState, setPriceMaxState] = useState<null | number>(
    priceMax ?? null
  );

  const [checkedFilters, setCheckedFilters] = useState(sectionCheckboxes);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const { hasVisualViewport, height: viewportHeight } = useVisualViewport();

  const [selectedOption, setSelectedOption] = useState(
    type === "radio" ? sortBy || CategorySortKey.Relevance : sortBy
  );

  // Price validation state
  const [priceValidation, setPriceValidation] = useState({
    errorMessage: "",
    maxError: false,
    minError: false,
  });

  // Refs to access current values in validation
  const priceMinStateRef = useRef<null | number>(priceMin ?? null);
  const priceMaxStateRef = useRef<null | number>(priceMax ?? null);
  const priceMinRef = useRef<null | number>(priceMin ?? null);
  const priceMaxRef = useRef<null | number>(priceMax ?? null);
  const initialViewportHeightRef = useRef<null | number>(null);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetFilterToDefault = useCallback(() => {
    switch (type) {
      case "checkbox":
        setCheckedFilters(sectionCheckboxes);
        break;
      case "price":
        setPriceMinState(priceMin ?? null);
        setPriceMaxState(priceMax ?? null);
        break;
      case "radio":
        setSelectedOption(sortBy || CategorySortKey.Relevance);
        break;
    }
  }, [priceMax, priceMin, sectionCheckboxes, sortBy, type]);

  useEffect(() => {
    if (!drawerOpen) {
      resetFilterToDefault();
      setSearchQuery("");
      setIsInputFocused(false);
      setIsKeyboardOpen(false);
      initialViewportHeightRef.current = null;
    }
  }, [drawerOpen, resetFilterToDefault]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    if (!hasVisualViewport) {
      setIsKeyboardOpen(false);
      return;
    }

    if (
      initialViewportHeightRef.current === null ||
      viewportHeight > initialViewportHeightRef.current
    ) {
      initialViewportHeightRef.current = viewportHeight;
    }

    const keyboardHeight = initialViewportHeightRef.current - viewportHeight;

    // Ignore small height changes caused by browser chrome animations.
    setIsKeyboardOpen(keyboardHeight > 120);
  }, [drawerOpen, hasVisualViewport, viewportHeight]);

  // Update local state when external price values change
  useEffect(() => {
    setPriceMinState(priceMin ?? null);
    setPriceMaxState(priceMax ?? null);
    // Clear validation errors when prices are reset
    if (priceMin === null && priceMax === null) {
      setPriceValidation({
        errorMessage: "",
        maxError: false,
        minError: false,
      });
    }
  }, [priceMin, priceMax]);

  useEffect(() => {
    priceMinStateRef.current = priceMinState;
    priceMaxStateRef.current = priceMaxState;
    priceMinRef.current = priceMin ?? null;
    priceMaxRef.current = priceMax ?? null;
  }, [priceMinState, priceMaxState, priceMin, priceMax]);

  const debouncedValidate = useCallback(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    validationTimeoutRef.current = setTimeout(() => {
      setPriceValidation({
        errorMessage: "",
        maxError: false,
        minError: false,
      });

      const currentPriceMinState = priceMinStateRef.current;
      const currentPriceMaxState = priceMaxStateRef.current;

      if (currentPriceMaxState !== null && currentPriceMinState === null) {
        setPriceValidation({
          errorMessage:
            tPrice("errors.minRequired") || "Please enter min value",
          maxError: false,
          minError: true,
        });
        return;
      }

      if (currentPriceMinState !== null && currentPriceMaxState === null) {
        setPriceValidation({
          errorMessage:
            tPrice("errors.maxRequired") || "Please enter max value",
          maxError: true,
          minError: false,
        });
        return;
      }

      if (
        currentPriceMaxState !== null &&
        currentPriceMinState !== null &&
        currentPriceMaxState < currentPriceMinState
      ) {
        setPriceValidation({
          errorMessage:
            tPrice("errors.maxSmallerThanMin") ||
            "Max value is smaller than min",
          maxError: true,
          minError: false,
        });
        return;
      }
    }, 10);
  }, [tPrice]);

  const handleMinPriceChange = (price: null | number) => {
    if (price === null) {
      setPriceMinState(null);
    } else if (price >= 0) {
      setPriceMinState(price);
    }
    debouncedValidate();
  };

  const handleMaxPriceChange = (price: null | number) => {
    if (price === null) {
      setPriceMaxState(null);
    } else {
      setPriceMaxState(price);
    }
    debouncedValidate();
  };

  const handleMinBlur = () => {
    debouncedValidate();
  };

  const handleMaxBlur = () => {
    debouncedValidate();
  };

  const handleFilterToggle = (value: string, isChecked: CheckedState) => {
    const currentFilters = Array.isArray(checkedFilters) ? checkedFilters : [];

    const updatedFilters = isChecked
      ? [...currentFilters, value]
      : currentFilters.filter((filter) => filter !== value);

    setCheckedFilters(updatedFilters);
  };

  const handleClearFilter = () => {
    switch (type) {
      case "checkbox":
        setCheckedFilters([]);
        break;
      case "price":
        setPriceMinState(null);
        setPriceMaxState(null);
        break;
      case "radio":
        setSelectedOption(CategorySortKey.Relevance);
        break;
    }
  };

  const handleSumbit = () => {
    if (
      type === "price" &&
      (priceValidation.minError || priceValidation.maxError)
    ) {
      return;
    }

    startSubmitting(() => {
      switch (type) {
        case "checkbox":
          setCheckboxesForSection(sectionId, checkedFilters);
          break;
        case "price":
          setPrice(priceMinState, priceMaxState);
          break;
        case "radio":
          setSort(selectedOption);
          break;
      }
    });
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

  const isFilterApplied =
    type === "radio"
      ? selectedOption !== (sortBy || CategorySortKey.Relevance)
      : type === "price"
        ? (priceMinState !== priceMin || priceMaxState !== priceMax) &&
          !priceValidation.minError &&
          !priceValidation.maxError
        : type === "checkbox"
          ? !arraysEqual(checkedFilters, sectionCheckboxes) ||
            sectionCheckboxes.length > 0
          : false;

  const showClearButton =
    type === "radio"
      ? false
      : type === "price"
        ? priceMinState !== null || priceMaxState !== null
        : type === "checkbox"
          ? checkedFilters.length
          : false;

  const renderContent = () => {
    switch (type) {
      case "checkbox":
        return filteredOptions.length > 0 ? (
          filteredOptions.map((option) => {
            const optionId = `mobile-${sectionId}-${option.value}`;

            return (
              <div
                className="transition-default flex transform items-center gap-5 py-1.5 pe-5"
                key={optionId}
              >
                <Checkbox
                  checked={checkedFilters?.includes(option.value)}
                  className="peer size-5 border-2"
                  id={optionId}
                  onCheckedChange={(checked) =>
                    handleFilterToggle(option.value, checked)
                  }
                  value={option.value}
                />
                <Label
                  className="transition-default text-text-primary flex flex-1 flex-row justify-between text-xl font-normal peer-data-[state=checked]:font-semibold"
                  htmlFor={optionId}
                >
                  <span>{option.label}</span>
                  {option.count && (
                    <span className="text-text-tertiary text-base font-medium">
                      ({option.count})
                    </span>
                  )}
                </Label>
              </div>
            );
          })
        ) : (
          <div className="text-text-primary py-1.5 text-xl font-normal">
            {t("noResultsFor")} <span className="underline">{searchQuery}</span>
          </div>
        );
      case "price":
        return (
          <div className="flex flex-col gap-5">
            <div className="mb-2 flex flex-col gap-2">
              <div className="flex flex-row justify-center gap-10">
                <CategoryPriceInput
                  containerProps={{
                    className: "w-[160px]",
                  }}
                  currencyProps={{
                    className: "text-xl ps-4",
                  }}
                  hasError={priceValidation.minError}
                  inputProps={{
                    className:
                      "py-3 rounded-2xl text-xl w-full ps-10 text-center",
                  }}
                  labelProps={{
                    className: "text-text-primary text-xl font-normal mb-2",
                  }}
                  onBlur={handleMinBlur}
                  onPriceChange={handleMinPriceChange}
                  type="min"
                  value={priceMinState}
                />
                <CategoryPriceInput
                  containerProps={{
                    className: "w-[160px]",
                  }}
                  currencyProps={{
                    className: "text-xl ps-4",
                  }}
                  hasError={priceValidation.maxError}
                  inputProps={{
                    className:
                      "py-3 rounded-2xl text-xl w-full ps-10 text-center",
                  }}
                  labelProps={{
                    className: "text-text-primary text-xl font-normal mb-2",
                  }}
                  onBlur={handleMaxBlur}
                  onPriceChange={handleMaxPriceChange}
                  type="max"
                  value={priceMaxState}
                />
              </div>
              {(priceValidation.minError || priceValidation.maxError) && (
                <div className="flex flex-row justify-center gap-10">
                  {priceValidation.minError && (
                    <span className="w-[180px] text-center text-xs text-red-500">
                      {priceValidation.errorMessage}
                    </span>
                  )}
                  {priceValidation.maxError && (
                    <span className="w-[180px] text-center text-xs text-red-500">
                      {priceValidation.errorMessage}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      case "radio":
        return (
          <RadioGroup
            onValueChange={(value) => setSelectedOption(value)}
            value={selectedOption}
          >
            {filteredOptions.map((option) => (
              <div className="flex items-center gap-3" key={option.value}>
                <RadioGroupItem
                  className="peer"
                  id={option.value}
                  value={option.value}
                />
                <Label
                  className="transition-default text-text-primary flex flex-1 flex-row justify-between text-xl font-normal peer-data-[state=checked]:font-semibold"
                  htmlFor={option.value}
                >
                  {type === "radio"
                    ? tSort(`options.${option.label}` as any)
                    : option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      default:
        return null;
    }
  };

  const shouldHideBottomPadding =
    isKeyboardOpen || (!hasVisualViewport && isInputFocused);

  return (
    <DrawerContent
      className={cn(
        "bg-bg-default flex max-h-[85vh] flex-col border-none data-[vaul-drawer-direction=bottom]:rounded-t-none",
        {
          "pb-15": !shouldHideBottomPadding,
        }
      )}
    >
      <DrawerHeader className="py-3.75 border-border-base flex flex-row justify-between border-b px-5">
        <DrawerTitle className="text-text-primary text-xl font-medium">
          {dialogTitle}
        </DrawerTitle>
        <div className="flex flex-row gap-5">
          <button
            className={cn(
              "text-text-danger transition-default invisible text-base font-medium opacity-0",
              {
                "visible opacity-100": showClearButton,
              }
            )}
            onClick={handleClearFilter}
          >
            {t("clear")}
          </button>
          <DrawerClose>
            <Image alt="close" className="size-5" src={DownArrowIcon} />
          </DrawerClose>
        </div>
      </DrawerHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-2 px-5 pt-5">
        {isSearchable && (
          <div className="relative flex-shrink-0">
            <span className="absolute inset-y-0 start-0 flex items-center ps-5">
              <Image
                alt="search"
                className="size-5 rtl:rotate-90"
                src={SearchIcon}
              />
            </span>
            <input
              className="bg-bg-surface focus:border-border-primary focus:bg-bg-body text-text-primary focus:outline-border-primary placeholder:text-text-placeholder rounded-4xl px-12.5 py-2.75 block w-full border-none text-xl font-normal [appearance:textfield] focus:outline-[0.5px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              onBlur={() => setIsInputFocused(false)}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              placeholder={t("dialogSearchInputPlaceholder")}
              value={searchQuery}
            />
            {searchQuery.length > 0 && (
              <button
                className="transition-default absolute end-0 top-0 flex h-full items-center justify-center pe-5"
                onClick={() => setSearchQuery("")}
                title="Clear search"
                type="button"
              >
                <Image alt="clear" className="size-4" src={ClearIcon} />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-1">{renderContent()}</div>
        </div>
      </div>
      <DrawerFooter className="px-5 py-2">
        <DrawerClose asChild>
          <Button
            className="bg-btn-bg-primary h-12.5 text-text-inverse rounded-xl text-xl font-medium uppercase"
            disabled={!isFilterApplied || isNavigationPending || isSubmitting}
            onClick={handleSumbit}
            type="submit"
          >
            {isNavigationPending || isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t("apply")}
              </span>
            ) : (
              t("apply")
            )}
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  );
};
