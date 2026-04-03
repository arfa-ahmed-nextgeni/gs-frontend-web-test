import { NextRequest, NextResponse } from "next/server";

import { hasLocale } from "next-intl";

import { routing } from "@/i18n/routing";
import { getCategoryListingData } from "@/lib/actions/category/get-category-route-listing";
import { parseFiltersFromUrlSearchParams } from "@/lib/category/query";
import { type Locale } from "@/lib/constants/i18n";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { failure, isOk, ok } from "@/lib/utils/service-result";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

interface ParsedCategoryProductsRequest {
  categoryPath: string;
  categoryUid: string;
  currentPage: number;
  filters: Record<string, string[]>;
  locale: Locale;
  pageSize: number;
  sortBy?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsedRequest = parseCategoryProductsRequest(searchParams);

  if (!parsedRequest.ok) {
    return NextResponse.json(failure(parsedRequest.error), { status: 400 });
  }

  const { categoryPath, currentPage, filters, locale, pageSize, sortBy } =
    parsedRequest.data;

  try {
    const listingResult = await getCategoryListingData({
      categoryPath,
      filters,
      locale,
      page: currentPage,
      pageSize,
      sortBy,
    });

    if (!isOk(listingResult)) {
      return NextResponse.json(listingResult, {
        status: 500,
      });
    }

    const listingData = listingResult.data;
    const pageInfo = listingData.productResponse.page_info;

    return NextResponse.json(
      ok({
        page: pageInfo?.current_page || currentPage,
        products: listingData.products,
        totalPages: pageInfo?.total_pages || 0,
      })
    );
  } catch (error) {
    console.error("Error fetching category products:", error);
    return NextResponse.json(failure("Failed to fetch category products"), {
      status: 500,
    });
  }
}

function parseCategoryProductsRequest(
  searchParams: URLSearchParams
):
  | { data: ParsedCategoryProductsRequest; ok: true }
  | { error: string; ok: false } {
  const categoryUid = searchParams.get(QueryParamsKey.CategoryUid);
  const categoryPath = searchParams.get(QueryParamsKey.CategoryPath);
  const currentPageRaw = searchParams.get(QueryParamsKey.Page);
  const pageSizeRaw = searchParams.get(QueryParamsKey.PageSize);
  const locale = searchParams.get(QueryParamsKey.Locale);
  const sortBy = searchParams.get(QueryParamsKey.Sort);

  if (!categoryUid || !categoryPath) {
    return {
      error: "Missing required parameters: categoryUid and categoryPath",
      ok: false,
    };
  }

  if (!locale || !hasLocale(routing.locales, locale)) {
    return {
      error: "Invalid locale value",
      ok: false,
    };
  }

  const currentPage = parsePositiveInteger(currentPageRaw, DEFAULT_PAGE);
  if (!currentPage) {
    return {
      error: "Invalid page value",
      ok: false,
    };
  }

  const pageSize = parsePositiveInteger(pageSizeRaw, DEFAULT_PAGE_SIZE);
  if (!pageSize || pageSize > MAX_PAGE_SIZE) {
    return {
      error: "Invalid pageSize value",
      ok: false,
    };
  }

  const filters = parseFiltersFromUrlSearchParams(searchParams);

  return {
    data: {
      categoryPath,
      categoryUid,
      currentPage,
      filters,
      locale,
      pageSize,
      sortBy: sortBy || undefined,
    },
    ok: true,
  };
}

function parsePositiveInteger(
  value: null | string,
  defaultValue: number
): null | number {
  if (!value || value.trim() === "") {
    return defaultValue;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}
