import { NextRequest, NextResponse } from "next/server";

import { QueryParamsKey } from "@/lib/constants/query-params";

export function getOpenAppRedirectResponse(request: NextRequest) {
  const openAppParam = request.nextUrl.searchParams.get(QueryParamsKey.OpenApp);
  const storeUrlParam = request.nextUrl.searchParams.get(
    QueryParamsKey.StoreUrl
  );

  if (openAppParam !== "1") {
    return null;
  }

  const parsedStoreUrl = parseHttpUrl(storeUrlParam);
  if (!parsedStoreUrl) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.redirect(parsedStoreUrl);
}

export function parseHttpUrl(url: null | string) {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const isHttpProtocol =
      parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";

    if (!isHttpProtocol) {
      return null;
    }

    return parsedUrl;
  } catch {
    return null;
  }
}
