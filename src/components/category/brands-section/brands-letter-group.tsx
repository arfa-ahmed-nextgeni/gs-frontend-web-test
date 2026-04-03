"use client";

import { ReactNode, useMemo } from "react";

import { useSearchParams } from "next/navigation";

import { BrandCard } from "@/components/category/brands-section/brand-card";
import { useBrandsLetter } from "@/contexts/brands-letter-context";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { GroupedBrands } from "@/lib/types/brands";

export const BrandsLetterGroup = ({
  categoryAvailableLettersMap,
  categoryBrandsMap,
  defaultAvailableLetters,
  defaultGroupedBrands,
  fallbackComponent,
}: {
  categoryAvailableLettersMap: Record<string, string[]>;
  categoryBrandsMap: Record<string, GroupedBrands>;
  defaultAvailableLetters: string[];
  defaultGroupedBrands: GroupedBrands;
  fallbackComponent: ReactNode;
}) => {
  const searchParams = useSearchParams();

  const selectedCategoryId = searchParams.get(QueryParamsKey.CategoryId);
  const { selectedLetter } = useBrandsLetter();

  // Get grouped brands - use category-specific or default
  const groupedBrands = useMemo(() => {
    if (selectedCategoryId && categoryBrandsMap[selectedCategoryId]) {
      return categoryBrandsMap[selectedCategoryId];
    }
    return defaultGroupedBrands;
  }, [selectedCategoryId, categoryBrandsMap, defaultGroupedBrands]);

  // Get available letters - use category-specific or default
  const availableLetters = useMemo(() => {
    if (selectedCategoryId && categoryAvailableLettersMap[selectedCategoryId]) {
      return categoryAvailableLettersMap[selectedCategoryId];
    }
    return defaultAvailableLetters;
  }, [
    selectedCategoryId,
    categoryAvailableLettersMap,
    defaultAvailableLetters,
  ]);

  // Filter by letter if selected
  const lettersToRender = useMemo(() => {
    if (!selectedLetter || !availableLetters.includes(selectedLetter)) {
      return availableLetters;
    }

    return [selectedLetter];
  }, [availableLetters, selectedLetter]);

  // If no brands available, return fallback
  if (!groupedBrands || !availableLetters.length) {
    return fallbackComponent;
  }

  if (!lettersToRender.length) {
    return null;
  }

  return (
    <div className="gap-12.5 flex w-full flex-col">
      {lettersToRender.map((letter, letterIndex) => {
        const brands = groupedBrands[letter] ?? [];

        if (!brands.length) {
          return null;
        }

        const id =
          letter === "#"
            ? "symbols"
            : /^[A-Z]$/.test(letter)
              ? letter.toLowerCase()
              : letter;

        return (
          <div className="flex flex-col gap-5" id={id} key={letter}>
            <div className="flex items-center gap-2.5">
              <p className="text-text-primary text-lg font-normal lg:text-2xl">
                {letter}
              </p>
              <span className="bg-bg-surface h-0.5 flex-1 rounded-xl" />
            </div>
            <div className="flex flex-wrap gap-[clamp(5px,calc(5px+(100vw-320px)*5/110),10px)] gap-y-[clamp(10px,calc(10px+(100vw-320px)*10/110),20px)]">
              {brands.map((brand) => (
                <BrandCard
                  brand={brand}
                  isFirstLetterGroup={letterIndex === 0}
                  key={brand.uid}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
