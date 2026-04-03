"use client";

import { ChevronUpIcon } from "lucide-react";
import { useTranslations } from "next-intl";

interface StickyResultsCounterProps {
  count: string;
}

export const StickyResultsCounter = ({ count }: StickyResultsCounterProps) => {
  const t = useTranslations("search");
  const handleScrollToTop = () => {
    window.scrollTo({
      behavior: "smooth",
      top: 0,
    });
  };

  return (
    <button
      className="fixed bottom-[4.5rem] left-1/2 z-40 h-[40px] w-[200px] -translate-x-1/2 rounded-3xl border-t border-gray-200 bg-[#F3F3F3] p-3 transition-colors hover:bg-gray-200 lg:hidden"
      onClick={handleScrollToTop}
      type="button"
    >
      <div className="flex items-center justify-center">
        <span className="text-sm font-medium text-[#5D5D5D] underline">
          {t("showingResults", { count })}
        </span>
        <ChevronUpIcon className="ml-1 h-2.5 w-2.5" />
      </div>
    </button>
  );
};
