"use client";

import { useTranslations } from "next-intl";

interface RecentSearchesProps {
  onClearRecent: () => void;
  onSearchClick: (searchTerm: string) => void;
  recentSearches: string[];
}

const RecentSearches = ({
  onClearRecent,
  onSearchClick,
  recentSearches,
}: RecentSearchesProps) => {
  const t = useTranslations("HomePage.header.search");

  if (!recentSearches || recentSearches.length === 0) return null;

  return (
    <div className="mt-2 flex flex-col gap-3">
      <div className="mx-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          {t("recentSearches")}
        </h3>
        <button
          className="rounded-full bg-gray-100 px-2 py-1 text-xs text-[#FF6128] transition-colors hover:bg-gray-200"
          onClick={onClearRecent}
        >
          {t("clear")}
        </button>
      </div>
      <div className="mx-2 flex flex-wrap gap-2">
        {recentSearches.slice(0, 6).map((searchTerm) => (
          <button
            className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800"
            key={searchTerm}
            onClick={() => onSearchClick(searchTerm)}
          >
            {searchTerm}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentSearches;
