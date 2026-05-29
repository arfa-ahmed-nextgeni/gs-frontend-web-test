import type { MetadataRoute } from "next";

/**
 * Disable crawling for every route in this environment.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      disallow: "/",
      userAgent: "*",
    },
  };
}
