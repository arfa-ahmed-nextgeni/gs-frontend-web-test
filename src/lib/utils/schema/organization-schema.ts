import type { Organization, WithContext } from "schema-dts";

import { PROTOCOL } from "@/lib/constants/environment";
import { LOCALE_TO_DOMAIN } from "@/lib/constants/i18n";

import type { Locale } from "@/lib/constants/i18n";

/**
 * Generate Organization structured data
 * Should be included on every page (typically in the root layout)
 *
 * @see https://schema.org/Organization
 */
export function generateOrganizationSchema(
  locale: Locale
): WithContext<Organization> {
  const domain = LOCALE_TO_DOMAIN[locale];
  const baseUrl = `${PROTOCOL}://${domain}`;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    alternateName: "GoldenScent",
    // Contact Information
    contactPoint: {
      "@type": "ContactPoint",
      areaServed: ["SA", "AE", "KW", "OM"],
      availableLanguage: ["Arabic", "English"],
      contactType: "customer service",
      telephone: "+966114407335",
    },
    description:
      "Leading online perfume and beauty retailer in the Middle East",
    logo: `${baseUrl}/logo.png`, // Update with actual logo path
    name: "Golden Scent",

    // Social Media Profiles
    sameAs: [
      "https://www.facebook.com/pages/Golden-Scent/1406408942981198?ref_type=bookmark",
      "https://instagram.com/goldenscentcom",
      // "https://twitter.com/goldenscent",
      "https://www.youtube.com/channel/UC1BNNbjXEAfDytxQy9jtxlQ",
    ],

    url: baseUrl,

    // Address (if applicable)
    // address: {
    //   '@type': 'PostalAddress',
    //   streetAddress: 'Your Street Address',
    //   addressLocality: 'City',
    //   addressRegion: 'Region',
    //   postalCode: 'Postal Code',
    //   addressCountry: 'SA',
    // },
  };
}
