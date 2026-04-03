"use client";

import { ChangeEvent, ComponentProps } from "react";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

export const CategoryPriceInput = ({
  containerProps,
  currencyProps,
  hasError = false,
  inputProps,
  labelProps,
  onBlur,
  onPriceChange,
  shortLabel,
  showValue = true,
  type,
  value,
}: {
  containerProps?: ComponentProps<"div">;
  currencyProps?: ComponentProps<"span">;
  hasError?: boolean;
  inputProps?: ComponentProps<"input">;
  labelProps?: ComponentProps<"label">;
  onBlur?: () => void;
  onPriceChange: (price: null | number) => void;
  shortLabel?: boolean;
  showValue?: boolean;
  type: "max" | "min";
  value?: null | number;
}) => {
  const t = useTranslations("category.filtersSection.priceRangeFilter");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value === "") {
      onPriceChange(null);
      return;
    }

    if (value.endsWith(".")) {
      return;
    }

    const numValue = parseFloat(value);

    if (!isNaN(numValue) && numValue >= 0) {
      onPriceChange(numValue);
    }
  };

  const id = type === "min" ? "min-price" : "max-price";
  const label =
    type === "min"
      ? t(shortLabel ? "minInputShortLabel" : "minInputLabel")
      : t(shortLabel ? "maxInputShortLabel" : "maxInputLabel");

  if (!showValue) {
    return null;
  }

  return (
    <div
      {...containerProps}
      className={cn("flex flex-col gap-1", containerProps?.className)}
    >
      <label
        {...labelProps}
        className={cn(
          "text-text-secondary block text-xs font-normal",
          labelProps?.className
        )}
        htmlFor={id}
      >
        {label}
      </label>
      <div className="relative">
        <span
          {...currencyProps}
          className={cn(
            "font-saudi-riyal text-text-primary absolute inset-y-0 start-0 flex items-center ps-2 text-xs font-normal",
            currencyProps?.className
          )}
        >
          &#xE900;
        </span>
        <input
          {...inputProps}
          className={cn(
            "bg-bg-surface focus:border-border-primary focus:bg-bg-body text-text-primary focus:outline-border-primary w-18 block rounded-2xl border-none py-3 pe-2 ps-6 text-xs font-normal [appearance:textfield] focus:outline-[0.5px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            hasError &&
              "border-red-500 focus:border-red-500 focus:outline-red-500",
            inputProps?.className
          )}
          id={id}
          inputMode="decimal"
          min="0"
          onBlur={onBlur}
          onChange={handleChange}
          pattern="[0-9]*\.?[0-9]*"
          step="0.01"
          type="number"
          value={value ?? ""}
        />
      </div>
    </div>
  );
};
