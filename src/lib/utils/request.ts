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
