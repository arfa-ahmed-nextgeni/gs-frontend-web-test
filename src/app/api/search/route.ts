import { NextRequest, NextResponse } from "next/server";

import { hasLocale } from "next-intl";

import { routing } from "@/i18n/routing";
import { getBrands } from "@/lib/actions/category/get-brands";
import { getSearchListingData } from "@/lib/actions/search/get-search-route-listing";
import {
  parseFiltersFromUrlSearchParams,
  parseSortParam,
} from "@/lib/category/query";
import { type Locale } from "@/lib/constants/i18n";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { failure, isOk, ok } from "@/lib/utils/service-result";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 20;

interface ParsedSearchRequest {
  filters: Record<string, string[]>;
  locale: Locale;
  page: number;
  pageSize: number;
  phrase?: string;
  sortBy?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsedRequest = parseSearchRequest(searchParams);

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
      sortMode: "autocomplete",
    });

    if (!isOk(listingResult)) {
      return NextResponse.json(listingResult, {
        status: 500,
      });
    }

    const listingData = listingResult.data;
    const response = listingData.productResponse;

    // Build a name → urlPath lookup from the full brand list so every brand
    // pill can navigate to the correct brand category page. getBrands() is
    // cached ("use cache" + React cache) so this is a memory read after the
    // first request — no extra network call.
    const brandPathByName = new Map<string, string>();
    const brandsResult = await getBrands({ locale });
    if (isOk(brandsResult)) {
      for (const brands of Object.values(brandsResult.data)) {
        for (const brand of brands) {
          if (brand.name && brand.urlPath) {
            brandPathByName.set(brand.name.toLowerCase(), brand.urlPath);
          }
        }
      }
    }

    // Inject urlPath into brand_new facet buckets so the client can navigate
    // directly to the brand category page without a separate API call.
    const facets = (response.facets || []).map((facet: any) => {
      if (facet.attribute !== "brand_new" || !facet.buckets) return facet;
      return {
        ...facet,
        buckets: facet.buckets.map((bucket: any) => ({
          ...bucket,
          urlPath: bucket.title
            ? brandPathByName.get(bucket.title.toLowerCase())
            : undefined,
        })),
      };
    });

    const responseData = {
      facets,
      products: listingData.products,
      related_terms: response.related_terms || [],
      suggestions: response.suggestions || [],
      totalCount: response.total_count || 0,
    };

    return NextResponse.json(ok(responseData));
  } catch (error) {
    console.error("Search API error:", error);
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

function parseSearchRequest(
  searchParams: URLSearchParams
): { data: ParsedSearchRequest; ok: true } | { error: string; ok: false } {
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
  const sortBy = parseSortParam(
    searchParams.get(QueryParamsKey.Sort) ?? undefined
  );
  const filters = parseFiltersFromUrlSearchParams(searchParams);

  return {
    data: {
      filters,
      locale: locale as Locale,
      page,
      pageSize,
      phrase: phrase || undefined,
      sortBy,
    },
    ok: true,
  };
}
