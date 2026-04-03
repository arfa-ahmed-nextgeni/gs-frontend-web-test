import { NextRequest, NextResponse } from "next/server";

import { getCustomerOrderByNumber } from "@/lib/actions/customer/orders";
import { Locale } from "@/lib/constants/i18n";
import { QueryParamsKey } from "@/lib/constants/query-params";

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/customer/orders/[number]">
) {
  const { number } = await context.params;
  const { searchParams } = new URL(request.url);

  const locale = searchParams.get(QueryParamsKey.Locale) as Locale;

  const result = await getCustomerOrderByNumber({
    locale,
    orderNumber: number,
  });

  return NextResponse.json(result);
}
