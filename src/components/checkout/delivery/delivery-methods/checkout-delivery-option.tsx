"use client";

import Image from "next/image";

import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

interface CheckoutDeliveryOptionProps {
  carrierTitle?: string;
  estimatedTime?: string;
  icon: string;
  iconAlt: string;
  isSelected: boolean;
  name?: string;
  onChange: () => void;
  price: React.ReactNode;
  value: string;
}

export function CheckoutDeliveryOption({
  carrierTitle,
  estimatedTime,
  icon,
  iconAlt,
  isSelected,
  name,
  onChange,
  price,
  value,
}: CheckoutDeliveryOptionProps) {
  const displayName = carrierTitle ?? name ?? "";
  const isMobile = useIsMobile();

  // Remove "Delivery in", "Estimated Delivery" (EN) and "التوصيل خلال" (AR) prefixes from estimated time (mobile only)
  const cleanedEstimatedTime =
    isMobile && estimatedTime
      ? estimatedTime
          .replace(/^(Estimated Delivery|Delivery in|التوصيل خلال):?\s*/i, "")
          .trim()
      : estimatedTime;

  return (
    <label className="flex h-[45px] cursor-pointer items-center justify-between rounded-[10px] px-4 py-3">
      <div className="flex items-center gap-2 lg:gap-3">
        <span className="bg-bg-default inline-flex size-6 items-center justify-center rounded-full">
          <Image alt={iconAlt} className="h-5 w-5" src={icon} />
        </span>
        <div className="flex flex-row items-center gap-1.5 lg:gap-4">
          <span className="text-text-primary text-[15px] font-medium">
            {displayName}
          </span>
          {cleanedEstimatedTime && (
            <span
              className={cn(
                "text-xs",
                value === "express" ? "text-[#FE5000]" : "text-[#5D5D5D]"
              )}
            >
              {cleanedEstimatedTime}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center text-[15px] font-medium text-[#00C7B1]">
          {price}
        </span>
        <input
          checked={isSelected}
          className="sr-only"
          name="delivery"
          onChange={(e) => {
            if (e.target.checked) {
              onChange();
            }
          }}
          type="radio"
          value={value}
        />
        <span
          className={`relative inline-flex size-5 items-center justify-center rounded-full ${
            isSelected
              ? "border-[1.5px] border-[#5D5D5D]"
              : "border border-[#5D5D5D]"
          }`}
        >
          {isSelected && (
            <>
              <span className="absolute size-3.5 rounded-full border-[1.5px] border-[#E5E7EB] bg-white" />
              <span className="absolute size-3 rounded-full bg-[#6543F5]" />
            </>
          )}
        </span>
      </div>
    </label>
  );
}
