import { type NextRequest } from "next/server";

import { getSitemapResponse } from "@/lib/utils/sitemap/get-sitemap-response";

export async function GET(
  request: NextRequest,
  context: { params: { locale: string } | Promise<{ locale: string }> }
) {
  const params = await context.params;
  const locale = params.locale?.toLowerCase() || "ar";
  const preferredLanguage = locale.startsWith("en") ? "en" : "ar";

  return getSitemapResponse({ preferredLanguage, request });
}
