import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { PROTOCOL } from "@/lib/constants/environment";

/**
 * Dynamic robots.txt generation for Next.js App Router
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  // Get current domain from request headers
  const headersList = await headers();
  const host = headersList.get("host") || headersList.get("x-forwarded-host");
  const protocol = headersList.get("x-forwarded-proto") || PROTOCOL;

  // Build base URL for sitemap reference
  const baseUrl = host ? `${protocol}://${host}` : "";

  return {
    rules: [
      {
        allow: ["/", "/c/", "/p/", "/lp/", "/_next/static/", "/_next/image"],
        disallow: [
          "/customer/",
          "/account/",
          "/checkout/",
          "/cart/",
          "/wishlist/",
          "/catalogsearch/",
          "/search",
          "/sendfriend/",
          "/review/",
          "/compare/",
          "/tag/",
          "/*?*utm_source=*",
          "/*?*utm_medium=*",
          "/*?*utm_campaign=*",
          "/*?*utm_term=*",
          "/*?*utm_content=*",
          "/*?*utm_*",
          "/*?*gclid=*",
          "/*?*fbclid=*",
          "/*?*msclkid=*",
          "/*?*sort=*",
          "/*?*dir=*",
          "/*?*price=*",
          "/*?*brand=*",
          "/*?*q=*",
          "/api/",
        ],
        userAgent: "*",
      },
    ],
    sitemap: baseUrl ? `${baseUrl}/sitemap.xml` : undefined,
  };
}
