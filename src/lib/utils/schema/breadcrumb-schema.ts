import type { BreadcrumbList, ListItem, WithContext } from "schema-dts";

import { PROTOCOL } from "@/lib/constants/environment";
import { LOCALE_TO_DOMAIN } from "@/lib/constants/i18n";

import type { Locale } from "@/lib/constants/i18n";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate BreadcrumbList structured data
 * Should be included on pages with breadcrumb navigation
 *
 * @see https://schema.org/BreadcrumbList
 */
export function generateBreadcrumbSchema({
  items,
  locale,
}: {
  items: BreadcrumbItem[];
  locale: Locale;
}): WithContext<BreadcrumbList> {
  const domain = LOCALE_TO_DOMAIN[locale];
  const baseUrl = `${PROTOCOL}://${domain}`;

  const listItems: ListItem[] = items.map((item, index) => ({
    "@type": "ListItem",
    item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    name: item.name,
    position: index + 1,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: listItems,
  };
}
