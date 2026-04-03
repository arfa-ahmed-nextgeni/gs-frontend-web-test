import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { HEADERS } from "@/lib/constants/api";

/**
 * Sitemap route handler
 * Fetches sitemap XML from S3 based on the current domain/host
 *
 * S3 URL format: https://s3-eu-west-1.amazonaws.com/gs-euw1-public-data-prod/sitemaps/{host}.xml
 *
 * Example:
 * - www.goldenscent.com → sitemaps/www.goldenscent.com.xml
 * - ae.goldenscent.com → sitemaps/ae.goldenscent.com.xml
 */
export async function GET() {
  // Get host from request headers
  const headersList = await headers();
  try {
    const host =
      headersList.get(HEADERS.HOST) ||
      headersList.get("x-forwarded-host") ||
      "";

    if (!host) {
      return new NextResponse("Host header not found", { status: 400 });
    }

    // Remove port if present (e.g., localhost:3000 → localhost)
    const hostname = host.split(":")[0];

    // Build S3 URL for sitemap
    const sitemapUrl = `https://s3-eu-west-1.amazonaws.com/gs-euw1-public-data-prod/sitemaps/${hostname}.xml`;

    // Fetch sitemap from S3
    const response = await fetch(sitemapUrl, {
      headers: {
        "Cache-Control": "no-cache",
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch sitemap from S3: ${sitemapUrl}, status: ${response.status}`
      );
      return new NextResponse("Sitemap not found", {
        status: response.status === 404 ? 404 : 500,
      });
    }

    // Get XML content
    const xmlContent = await response.text();

    // Return XML response with proper headers
    return new NextResponse(xmlContent, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Content-Type": "text/xml; charset=utf-8",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching sitemap:", error);
    return new NextResponse("Error fetching sitemap", { status: 500 });
  }
}
