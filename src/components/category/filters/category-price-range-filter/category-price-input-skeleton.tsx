"use client";

import { useTranslations } from "next-intl";

import { useStoreConfig } from "@/contexts/store-config-context";
import { PRICE_RANGE_BOUNDS } from "@/lib/constants/category/category-filters";
import { cn } from "@/lib/utils";
import { getCurrencySymbol } from "@/lib/utils/price";

export const CategoryPriceInputSkeleton = ({
  type,
}: {
  type: "max" | "min";
}) => {
  const t = useTranslations("category.filtersSection.priceRangeFilter");
  const { storeConfig } = useStoreConfig();
  const currencyCode = storeConfig?.currencyCode || "SAR";
  const currencySymbol = getCurrencySymbol(currencyCode);

  const value =
    type === "min" ? PRICE_RANGE_BOUNDS.MIN : PRICE_RANGE_BOUNDS.MAX;
  const label = type === "min" ? t("minInputLabel") : t("maxInputLabel");

  return (
    <div className="flex animate-pulse flex-col gap-1">
      <label className="text-text-secondary block text-xs font-normal">
        {label}
      </label>
      <div className="relative">
        {currencySymbol && (
          <span className="text-text-primary font-gilroy absolute inset-y-0 start-0 flex items-center ps-2 text-xs font-normal">
            {currencySymbol}
          </span>
        )}
        <input
          className={cn(
            "w-16.25 bg-bg-surface focus:border-border-primary focus:bg-bg-body text-text-primary focus:outline-border-primary block rounded-2xl border-none py-1.5 pe-2 text-xs font-normal [appearance:textfield] focus:outline-[0.5px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            currencySymbol ? "ps-6" : "ps-2"
          )}
          disabled
          type="number"
          value={value}
        />
      </div>
    </div>
  );
};
