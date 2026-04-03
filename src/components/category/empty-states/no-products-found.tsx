"use client";

import { useMemo } from "react";

import { useLocale } from "next-intl";

import { useFilters } from "@/contexts/category-filter-context";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";

/**
 * Empty state component when no products are found in category
 * Shows helpful message with actions
 */
export function NoProductsFound() {
  const locale = useLocale();
  const router = useRouter();
  const {
    clearAllFiltersExceptSearch,
    state: { checkboxes, priceMax, priceMin, sortBy },
  } = useFilters();

  // Fallback to English if translations not available
  const texts = {
    ar: {
      browseAll: "تصفح جميع المنتجات",
      checkSpelling: "تحقق من الإملاء",
      description:
        "لم نتمكن من العثور على أي منتجات تطابق معاييرك. حاول تعديل الفلاتر أو تصفح فئاتنا الأخرى.",
      goBack: "العودة",
      removeFilters: "قم بإزالة بعض الفلاتر لرؤية المزيد من النتائج",
      suggestions: "اقتراحات",
      title: "لم يتم العثور على منتجات",
      tryDifferentKeywords: "جرب كلمات مفتاحية مختلفة أو أكثر عمومية",
    },
    en: {
      browseAll: "Browse all products",
      checkSpelling: "Check your spelling",
      description:
        "We couldn't find any products matching your criteria. Try adjusting your filters or browse our other categories.",
      goBack: "Go back",
      removeFilters: "Remove some filters to see more results",
      suggestions: "Suggestions",
      title: "No products found",
      tryDifferentKeywords: "Try different or more general keywords",
    },
  };

  const lang = locale.startsWith("ar") ? "ar" : "en";
  const text = texts[lang];
  const hasAppliedFilters = useMemo(
    () =>
      Object.values(checkboxes).some((values) => values.length > 0) ||
      priceMin !== null ||
      priceMax !== null ||
      Boolean(sortBy),
    [checkboxes, priceMax, priceMin, sortBy]
  );

  const handleGoBack = () => {
    if (hasAppliedFilters) {
      clearAllFiltersExceptSearch();
      return;
    }

    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(ROUTES.HOME);
  };

  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8">
      <div className="text-center">
        <svg
          className="mx-auto h-24 w-24 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
        </svg>
        <h3 className="text-text-primary mt-6 text-xl font-semibold">
          {text.title}
        </h3>
        <p className="text-text-secondary mt-2 text-sm">{text.description}</p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            className="bg-bg-brand hover:bg-bg-brand/90 inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium text-white transition-colors"
            href={ROUTES.HOME}
          >
            {text.browseAll}
          </Link>
          <button
            className="border-border-base text-text-primary hover:bg-bg-hover inline-flex items-center justify-center rounded-md border px-6 py-3 text-sm font-medium transition-colors"
            onClick={handleGoBack}
          >
            {text.goBack}
          </button>
        </div>

        <div className="mt-8">
          <p className="text-text-tertiary mb-3 text-xs font-medium uppercase">
            {text.suggestions}
          </p>
          <ul className="text-text-secondary space-y-2 text-sm">
            <li>• {text.checkSpelling}</li>
            <li>• {text.tryDifferentKeywords}</li>
            <li>• {text.removeFilters}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
