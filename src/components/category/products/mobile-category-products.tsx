"use client";

import { useEffect, useMemo, useRef } from "react";

import { useTranslations } from "next-intl";

import { InfiniteScrollError } from "@/components/category/errors/infinite-scroll-error";
import { CategoryProductGridClient } from "@/components/category/products/category-product-grid-client";
import { MobileCategoryProductsSkeleton } from "@/components/category/skeletons/mobile-category-products-skeleton";
import { useFilters } from "@/contexts/category-filter-context";
import { useCategoryMobileProductsInfiniteQuery } from "@/hooks/queries/category/use-category-mobile-products-infinite-query";
import { useSearchParams } from "@/i18n/client-navigation";
import { parseFiltersFromUrlSearchParams } from "@/lib/category/query";
import { type Locale } from "@/lib/constants/i18n";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { type ProductCardModel } from "@/lib/models/product-card-model";
import { trackInfiniteScrollLoad } from "@/lib/utils/analytics";

interface MobileCategoryProductsProps {
  categoryMetadata?: {
    name: string;
    uid: string;
    urlPath?: string;
  };
  categoryPath: string;
  categoryUid: string;
  initialPage: number;
  initialProducts: ProductCardModel[];
  isBulletDeliveryEnabled: boolean;
  locale: Locale;
  searchTerm?: string;
  totalPages: number;
}

export function MobileCategoryProducts({
  categoryMetadata,
  categoryPath,
  categoryUid,
  initialPage,
  initialProducts,
  isBulletDeliveryEnabled,
  locale,
  searchTerm,
  totalPages,
}: MobileCategoryProductsProps) {
  const t = useTranslations("category");
  const { isNavigationPending } = useFilters();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString() || "";
  const observerTarget = useRef<HTMLDivElement>(null);
  const trackedPagesRef = useRef<Set<number>>(new Set([initialPage]));

  const { filters, filtersSignature, sortBy } = useMemo(() => {
    const params = new URLSearchParams(searchParamsString);
    const parsedFilters = parseFiltersFromUrlSearchParams(params);

    return {
      filters: parsedFilters,
      filtersSignature: serializeFilters(parsedFilters),
      sortBy: params.get(QueryParamsKey.Sort) || undefined,
    };
  }, [searchParamsString]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch,
  } = useCategoryMobileProductsInfiniteQuery({
    categoryPath,
    categoryUid,
    filters,
    filtersSignature,
    initialPage,
    initialProducts,
    locale,
    searchTerm,
    sortBy,
    totalPages,
  });

  const products = useMemo(
    () => data?.pages.flatMap((page) => page.products) || [],
    [data?.pages]
  );
  const isFilterNavigationLoading = isNavigationPending && !isFetchingNextPage;

  useEffect(() => {
    trackedPagesRef.current = new Set([initialPage]);
  }, [initialPage, searchParamsString]);

  useEffect(() => {
    if (!categoryMetadata) {
      return;
    }

    data.pages.forEach((pageData) => {
      if (trackedPagesRef.current.has(pageData.page)) {
        return;
      }

      trackedPagesRef.current.add(pageData.page);
      trackInfiniteScrollLoad({
        categoryName: categoryMetadata.name,
        page: pageData.page,
        productsLoaded: pageData.products.length,
      });
    });
  }, [categoryMetadata, data.pages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const shouldLoad =
          entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage;

        if (shouldLoad) {
          void fetchNextPage();
        }
      },
      {
        rootMargin: "120px",
        threshold: 0.1,
      }
    );

    const target = observerTarget.current;

    if (target) {
      observer.observe(target);
    }

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const showLoadMoreError = isFetchNextPageError;

  return (
    <div className="flex flex-col gap-6">
      {isFilterNavigationLoading ? (
        <MobileCategoryProductsSkeleton />
      ) : (
        <CategoryProductGridClient
          categoryId={
            categoryUid && !Number.isNaN(Number.parseInt(categoryUid, 10))
              ? Number.parseInt(categoryUid, 10)
              : undefined
          }
          isBulletDeliveryEnabled={isBulletDeliveryEnabled}
          products={products}
          searchTerm={searchTerm}
        />
      )}

      {showLoadMoreError && (
        <InfiniteScrollError
          onRetry={() => {
            if (hasNextPage) {
              void fetchNextPage();
              return;
            }

            void refetch();
          }}
        />
      )}

      {hasNextPage && !showLoadMoreError && (
        <div className="flex justify-center pb-16 pt-8" ref={observerTarget}>
          <div className="flex items-center gap-2">
            <div className="bg-border-base h-4 w-4 animate-spin rounded-full border-2 border-t-blue-600" />
            <span className="text-text-secondary text-sm">
              {t("loadingMore")}
            </span>
          </div>
        </div>
      )}

      {!hasNextPage && products.length > 0 && !showLoadMoreError && (
        <div className="flex justify-center py-8">
          <span className="text-text-secondary text-sm">
            {t("endOfProducts")}
          </span>
        </div>
      )}
    </div>
  );
}

function serializeFilters(filters: Record<string, string[]>) {
  return Object.entries(filters)
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([key, values]) =>
      values
        .slice()
        .sort()
        .map((v) => `${key}:${v}`)
    )
    .join("|");
}
