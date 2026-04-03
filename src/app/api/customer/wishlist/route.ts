import { NextRequest, NextResponse } from "next/server";

import { getCustomerWishlist } from "@/lib/actions/customer/wishlist/get-customer-wishlist";
import { Locale } from "@/lib/constants/i18n";
import { QueryParamsKey } from "@/lib/constants/query-params";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const locale = searchParams.get(QueryParamsKey.Locale) as Locale;
  const page = parseInt(searchParams.get(QueryParamsKey.Page) || "1", 10);
  const pageSize = parseInt(
    searchParams.get(QueryParamsKey.PageSize) || "20",
    10
  );

  const response = await getCustomerWishlist({
    locale,
    page,
    pageSize,
  });

  return NextResponse.json(response);
}
