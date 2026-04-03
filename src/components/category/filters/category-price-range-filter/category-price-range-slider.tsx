"use client";

import { Slider } from "@/components/ui/slider";
import { PRICE_RANGE_BOUNDS } from "@/lib/constants/category/category-filters";

export const CategoryPriceRangeSlider = ({
  bounds,
  onInteractionChange,
  onRangeChange,
  value,
}: {
  bounds?: { max: number; min: number };
  onInteractionChange?: (isInteracting: boolean) => void;
  onRangeChange: (value: number[]) => void;
  value: number[];
}) => {
  return (
    <Slider
      className="mb-4 w-full"
      defaultValue={value}
      max={bounds?.max ?? PRICE_RANGE_BOUNDS.MAX}
      min={bounds?.min ?? PRICE_RANGE_BOUNDS.MIN}
      onPointerDown={() => onInteractionChange?.(true)}
      onPointerUp={() => onInteractionChange?.(false)}
      onTouchEnd={() => onInteractionChange?.(false)}
      onValueChange={onRangeChange}
      step={1}
      value={value}
    />
  );
};
