"use client";

import { MouseEvent, useCallback, useMemo } from "react";

import { useSearchParams } from "next/navigation";

import { useBrandsLetter } from "@/contexts/brands-letter-context";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { cn } from "@/lib/utils";

export const BrandsAlphabetNav = ({
  categoryAlphabetLinksMap,
  defaultAlphabetLinks,
}: {
  categoryAlphabetLinksMap: Record<string, string[]>;
  defaultAlphabetLinks: string[];
}) => {
  const searchParams = useSearchParams();

  const { selectedLetter, setSelectedLetter } = useBrandsLetter();

  const selectedCategoryId = searchParams.get(QueryParamsKey.CategoryId);

  const alphabetLinks = useMemo(() => {
    if (selectedCategoryId && categoryAlphabetLinksMap[selectedCategoryId]) {
      return categoryAlphabetLinksMap[selectedCategoryId];
    }
    return defaultAlphabetLinks;
  }, [selectedCategoryId, categoryAlphabetLinksMap, defaultAlphabetLinks]);

  const validSelectedLetter =
    selectedLetter && alphabetLinks.includes(selectedLetter)
      ? selectedLetter
      : null;

  const handleLetterClick = useCallback(
    (letter: string) => (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      if (letter === validSelectedLetter) {
        return;
      }

      setSelectedLetter(letter);
    },
    [validSelectedLetter, setSelectedLetter]
  );

  if (!alphabetLinks.length) {
    return null;
  }

  return (
    <div className="scrollbar-hidden sticky top-[var(--mobile-header-height)] z-40 max-h-[calc(100vh-(var(--mobile-header-height)+60px))] overflow-y-auto pt-[clamp(30px,30px+(100vh-568px)*0.0704,50px)] lg:static lg:z-0 lg:mt-0 lg:max-h-none lg:overflow-visible lg:py-0">
      <div className="flex flex-col items-center justify-center gap-[clamp(5px,5px+(100vh-568px)/40.57,10px)] lg:flex-row lg:flex-wrap lg:gap-5">
        {alphabetLinks.map((letter) => (
          <button
            aria-current={letter === validSelectedLetter ? "page" : undefined}
            className={cn(
              "text-text-primary transition-default text-[clamp(10px,10px+(100vh-568px)/47.33,14px)] font-normal leading-none hover:font-semibold lg:text-lg",
              letter === validSelectedLetter && "font-semibold"
            )}
            key={letter}
            onClick={handleLetterClick(letter)}
            type="button"
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
};
