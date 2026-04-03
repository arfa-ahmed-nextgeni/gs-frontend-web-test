import { NextRequest, NextResponse } from "next/server";

import { getCustomerOrders } from "@/lib/actions/customer/orders";
import { Locale } from "@/lib/constants/i18n";
import { QueryParamsKey } from "@/lib/constants/query-params";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get(QueryParamsKey.Locale) as Locale;
  const currentPage = parseInt(searchParams.get("currentPage") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");
  const sortBy = searchParams.get("sortBy") || undefined;
  // status parameter removed - no API support available

  const result = await getCustomerOrders({
    locale,
    options: { currentPage, pageSize, sortBy },
  });

  return NextResponse.json(result);
}
