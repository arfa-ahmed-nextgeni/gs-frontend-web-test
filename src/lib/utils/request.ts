import { NextRequest } from "next/server";

import { HEADERS } from "@/lib/constants/api";
import { PROTOCOL } from "@/lib/constants/environment";

/**
 * Extracts the base URL from a NextRequest
 * Used in API routes to construct redirect URLs
 */
export function getBaseUrlFromRequest(request: NextRequest): string {
  try {
    const host = request.headers.get(HEADERS.HOST);
    const protocol = request.headers.get(HEADERS.X_FORWARDED_PROTO) || PROTOCOL;

    if (host) {
      return `${protocol}://${host}`;
    }
  } catch (error) {
    console.error("Error getting base URL: ", error);
  }

  const url = new URL(request.url);
  const domain = url.hostname;

  return `${PROTOCOL}://${domain}`;
}

export function isNextRouterBackgroundRequest(request: NextRequest): boolean {
  const accept = request.headers.get(HEADERS.ACCEPT) ?? "";
  const isHtmlRequest = accept.includes("text/html");
  const isPageRequest = !request.nextUrl.pathname.startsWith("/api");
  const hasNextRouterSignal =
    request.nextUrl.searchParams.has("_rsc") ||
    request.headers.get("rsc") === "1" ||
    request.headers.has("next-router-state-tree") ||
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("next-router-segment-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch";

  return !isHtmlRequest && (hasNextRouterSignal || isPageRequest);
}
