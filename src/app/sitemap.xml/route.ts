import { type NextRequest } from "next/server";

import { getSitemapResponse } from "@/lib/utils/sitemap/get-sitemap-response";

export async function GET(request: NextRequest) {
  return getSitemapResponse({ preferredLanguage: "ar", request });
}
