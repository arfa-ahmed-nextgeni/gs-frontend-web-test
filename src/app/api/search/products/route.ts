import { NextRequest, NextResponse } from "next/server";

import { hasLocale } from "next-intl";

import { routing } from "@/i18n/routing";
import { getSearchListingData } from "@/lib/actions/search/get-search-route-listing";
import { parseFiltersFromUrlSearchParams } from "@/lib/category/query";
import { type Locale } from "@/lib/constants/i18n";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { failure, isOk, ok } from "@/lib/utils/service-result";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 20;

interface ParsedSearchProductsRequest {
  filters: Record<string, string[]>;
  locale: Locale;
  page: number;
  pageSize: number;
  phrase?: string;
  sortBy?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsedRequest = parseSearchProductsRequest(searchParams);

  if (!parsedRequest.ok) {
    return NextResponse.json(failure(parsedRequest.error), { status: 400 });
  }

  const { filters, locale, page, pageSize, phrase, sortBy } =
    parsedRequest.data;

  try {
    const listingResult = await getSearchListingData({
      filters,
      locale,
      page,
      pageSize,
      phrase,
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
        page: pageInfo?.current_page || page,
        products: listingData.products,
        totalPages: pageInfo?.total_pages || 0,
      })
    );
  } catch (error) {
    console.error("Search products API error:", error);
    return NextResponse.json(failure("Failed to fetch search products"), {
      status: 500,
    });
  }
}

function normalizeString(value: null | string | undefined): string {
  if (!value) {
    return "";
  }

  return value.trim();
}

function parsePositiveInteger(
  value: null | string,
  fallback: number
): null | number {
  if (!value || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

function parseSearchProductsRequest(
  searchParams: URLSearchParams
):
  | { data: ParsedSearchProductsRequest; ok: true }
  | { error: string; ok: false } {
  const locale = searchParams.get(QueryParamsKey.Locale);

  if (!locale || !hasLocale(routing.locales, locale)) {
    return {
      error: "Invalid locale",
      ok: false,
    };
  }

  const page = parsePositiveInteger(
    searchParams.get(QueryParamsKey.Page),
    DEFAULT_PAGE
  );

  if (!page) {
    return {
      error: "Invalid page value",
      ok: false,
    };
  }

  const pageSize = parsePositiveInteger(
    searchParams.get(QueryParamsKey.PageSize),
    DEFAULT_PAGE_SIZE
  );

  if (!pageSize || pageSize > MAX_PAGE_SIZE) {
    return {
      error: "Invalid pageSize value",
      ok: false,
    };
  }

  const phrase = normalizeString(searchParams.get(QueryParamsKey.Search));
  const sortBy = normalizeString(searchParams.get(QueryParamsKey.Sort));
  const filters = parseFiltersFromUrlSearchParams(searchParams);

  return {
    data: {
      filters,
      locale: locale as Locale,
      page,
      pageSize,
      phrase: phrase || undefined,
      sortBy: sortBy || undefined,
    },
    ok: true,
  };
}
