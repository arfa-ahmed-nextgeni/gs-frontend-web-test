"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

/**
 * Error fallback for product loading failures in category pages
 */
export function ProductLoadError() {
  const t = useTranslations("errors.productLoad");

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8">
      <div className="text-center">
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
        <h3 className="text-text-primary mt-4 text-lg font-medium">
          {t("title")}
        </h3>
        <p className="text-text-secondary mt-2 text-sm">{t("description")}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            className="bg-bg-brand hover:bg-bg-brand/90 rounded-md px-4 py-2 text-sm font-medium text-white"
            onClick={() => window.location.reload()}
          >
            {t("tryAgain")}
          </button>
          <Link
            className="border-border-base text-text-primary hover:bg-bg-hover rounded-md border px-4 py-2 text-sm font-medium"
            href="/"
          >
            {t("goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
