import { type NextRequest, NextResponse } from "next/server";

import { hasLocale } from "next-intl";

import { routing } from "@/i18n/routing";
import { getViewedProducts } from "@/lib/actions/products/get-viewed-products";
import { type Locale } from "@/lib/constants/i18n";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { failure, ok } from "@/lib/utils/service-result";

const responseHeaders = {
  "Cache-Control": "private, no-store",
};

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get(QueryParamsKey.Locale);

  if (!hasLocale(routing.locales, locale)) {
    return NextResponse.json(failure("Invalid locale"), {
      headers: responseHeaders,
      status: 400,
    });
  }

  const response = await getViewedProducts({
    locale: locale as Locale,
  });

  return NextResponse.json(
    ok({
      products: response.data.products,
    }),
    {
      headers: responseHeaders,
    }
  );
}
