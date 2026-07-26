import { NextRequest, NextResponse } from "next/server";

import { hasLocale } from "next-intl";

import { routing } from "@/i18n/routing";
import { getProductReviewsByLocale } from "@/lib/actions/products/get-product-reviews";
import { Locale } from "@/lib/constants/i18n";
import {
  PRODUCT_REVIEWS_SORT_OPTIONS,
  ProductReviewsSortOption,
} from "@/lib/constants/product/product-reviews/sort-by";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { parsePositiveInteger } from "@/lib/utils/number";
import { failure, isOk } from "@/lib/utils/service-result";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get(QueryParamsKey.Locale);

  if (!locale || !hasLocale(routing.locales, locale)) {
    return NextResponse.json(failure("Invalid locale"), { status: 400 });
  }

  const productId = parsePositiveInteger(searchParams.get("productId"));

  if (!productId) {
    return NextResponse.json(failure("Invalid productId"), { status: 400 });
  }

  const page = parsePositiveInteger(
    searchParams.get(QueryParamsKey.Page),
    DEFAULT_PAGE
  );

  if (!page) {
    return NextResponse.json(failure("Invalid page"), { status: 400 });
  }

  const pageSize = parsePositiveInteger(
    searchParams.get(QueryParamsKey.PageSize),
    DEFAULT_PAGE_SIZE
  );

  if (!pageSize) {
    return NextResponse.json(failure("Invalid pageSize"), { status: 400 });
  }

  const sortBy = searchParams.get(QueryParamsKey.Sort);

  if (
    sortBy &&
    !PRODUCT_REVIEWS_SORT_OPTIONS.includes(sortBy as ProductReviewsSortOption)
  ) {
    return NextResponse.json(failure("Invalid sort"), { status: 400 });
  }

  const productReviewsResponse = await getProductReviewsByLocale({
    locale: locale as Locale,
    page,
    pageSize,
    productId,
    sortBy: sortBy || undefined,
  });

  if (!isOk(productReviewsResponse)) {
    return NextResponse.json(productReviewsResponse, { status: 500 });
  }

  return NextResponse.json(productReviewsResponse);
}
