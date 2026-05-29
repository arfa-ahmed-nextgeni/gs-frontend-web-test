import { NextResponse } from "next/server";

const EMPTY_SITEMAP_XML =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" />';
const NO_SEO_X_ROBOTS_TAG =
  "noindex, nofollow, noarchive, nosnippet, noimageindex";

export function getSitemapResponse() {
  return new NextResponse(EMPTY_SITEMAP_XML, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Content-Type": "application/xml; charset=utf-8",
      "X-Robots-Tag": NO_SEO_X_ROBOTS_TAG,
    },
    status: 200,
  });
}
