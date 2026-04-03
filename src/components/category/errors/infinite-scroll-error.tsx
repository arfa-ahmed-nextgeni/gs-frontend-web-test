"use client";

import { useTranslations } from "next-intl";

interface InfiniteScrollErrorProps {
  onRetry?: () => void;
}

/**
 * Error component for infinite scroll failures
 * Shows inline error with retry option
 */
export function InfiniteScrollError({ onRetry }: InfiniteScrollErrorProps) {
  const t = useTranslations("errors.infiniteScroll");

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-yellow-200 bg-yellow-50 p-6">
      <div className="text-center">
        <svg
          className="mx-auto h-10 w-10 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
        <p className="mt-2 text-sm font-medium text-yellow-900">{t("title")}</p>
        {onRetry && (
          <button
            className="mt-3 rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
            onClick={onRetry}
          >
            {t("tryAgain")}
          </button>
        )}
      </div>
    </div>
  );
}
