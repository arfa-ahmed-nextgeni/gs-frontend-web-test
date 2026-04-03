import { connection, NextRequest, NextResponse } from "next/server";

import { getCartDetails } from "@/lib/actions/cart/get-cart-details";
import { Locale } from "@/lib/constants/i18n";
import { QueryParamsKey } from "@/lib/constants/query-params";

export async function GET(request: NextRequest) {
  await connection();
  const { searchParams } = new URL(request.url);

  const locale = searchParams.get(QueryParamsKey.Locale) as Locale;
  const page = parseInt(searchParams.get(QueryParamsKey.Page) || "1", 10);
  const pageSize = parseInt(
    searchParams.get(QueryParamsKey.PageSize) || "20",
    10
  );

  const response = await getCartDetails({
    locale,
    page,
    pageSize,
    persistCartId: true,
  });

  return NextResponse.json(response);
}
