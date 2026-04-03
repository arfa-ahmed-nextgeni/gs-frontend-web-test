import type { WebSite, WithContext } from "schema-dts";

import { PROTOCOL } from "@/lib/constants/environment";
import { LOCALE_TO_DOMAIN } from "@/lib/constants/i18n";

import type { Locale } from "@/lib/constants/i18n";

/**
 * Generate WebSite structured data with search functionality
 * Should be included on the homepage
 *
 * @see https://schema.org/WebSite
 */
export function generateWebsiteSchema(locale: Locale): WithContext<WebSite> {
  const domain = LOCALE_TO_DOMAIN[locale];
  const baseUrl = `${PROTOCOL}://${domain}`;
  const language = locale.split("-")[0]; // 'en' or 'ar'
  const searchUrl = `${baseUrl}/${language}/search`;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    alternateName: "GoldenScent",
    description: "Shop perfumes, beauty products and cosmetics online",
    inLanguage: language === "ar" ? "ar" : "en",
    name: "Golden Scent",
    // Enable site search box in Google
    potentialAction: {
      "@type": "SearchAction",
      "query-input": "required name=search_term_string",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${searchUrl}?q={search_term_string}`,
      },
    } as any,

    url: baseUrl,
  };
}
