import { routing } from "@/i18n/routing";
import { PROTOCOL } from "@/lib/constants/environment";
import { LOCALE_TO_DOMAIN } from "@/lib/constants/i18n";
import { ProductCardModel } from "@/lib/models/product-card-model";

import type { Locale } from "@/lib/constants/i18n";

/**
 * Generate absolute canonical URL with proper domain and locale
 * This is the main function to use for canonical URLs
 */
export function generateAbsoluteCanonicalUrl({
  locale,
  pathname,
  searchParams,
}: {
  locale: Locale;
  pathname: string;
  searchParams?: Record<string, number | string | undefined>;
}): string {
  const domain = getDomainForLocale(locale);
  // Honor next-intl `as-needed`: the domain's default locale is served without
  // a prefix, so its canonical must be prefix-less (empty string here).
  const localePrefix = getCanonicalLocalePrefix(locale);

  // Reduce the incoming pathname to a prefix-less base path, stripping any
  // stale /en or /ar so we never emit e.g. /ar for a default-locale page or
  // double-prefix an already-prefixed path.
  let basePath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (basePath === "/en" || basePath === "/ar") {
    basePath = "/";
  } else if (basePath.startsWith("/en/") || basePath.startsWith("/ar/")) {
    basePath = basePath.replace(/^\/[a-z]{2}/, "");
  }

  // Apply the correct prefix for this locale, then strip trailing slash so the
  // canonical matches the actual URL (e.g. /en not /en/, / for the root).
  let normalizedPathname = `${localePrefix}${basePath}`;
  normalizedPathname = normalizedPathname.replace(/\/+$/, "") || "/";

  // Build query string from searchParams
  const queryString = searchParams
    ? Object.entries(searchParams)
        .filter(
          ([, value]) => value !== undefined && value !== null && value !== ""
        )
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join("&")
    : "";

  const fullUrl = `${domain}${normalizedPathname}${queryString ? `?${queryString}` : ""}`;
  return fullUrl;
}

/**
 * Generate canonical URL for paginated pages
 * @deprecated Use generateAbsoluteCanonicalUrl instead for better SEO compliance
 */
export function generateCanonicalUrl({
  baseUrl,
  currentPage,
  locale,
}: {
  baseUrl: string;
  currentPage: number;
  locale?: Locale;
}): string {
  const pageParam = currentPage > 1 ? `?page=${currentPage}` : "";
  const url = `${baseUrl}${pageParam}`;

  // If locale is provided, generate absolute URL
  if (locale) {
    return generateAbsoluteCanonicalUrl({
      locale,
      pathname: baseUrl,
      searchParams: currentPage > 1 ? { page: currentPage } : undefined,
    });
  }

  return url;
}

/**
 * Generate hreflang links for multi-locale support with proper domain mapping
 * @deprecated Use generateHreflangTags instead for Goldenscent structure compliance
 */
export function generateHreflangLinks({
  baseUrl,
  currentPage,
  includeAllLocales = false,
}: {
  baseUrl: string;
  currentPage: number;
  includeAllLocales?: boolean;
}): Record<string, string> {
  const pageParam = currentPage > 1 ? `?page=${currentPage}` : "";

  // Default to main locales for better performance
  const mainLocales: Locale[] = [
    "ar-SA" as Locale,
    "en-SA" as Locale,
    "ar-AE" as Locale,
    "en-AE" as Locale,
    "ar-KW" as Locale,
    "en-KW" as Locale,
    "ar-OM" as Locale,
    "en-OM" as Locale,
  ];

  const allLocales: Locale[] = includeAllLocales
    ? (Object.keys(LOCALE_TO_DOMAIN) as Locale[])
    : mainLocales;

  const hreflangs: Record<string, string> = {};

  allLocales.forEach((locale) => {
    const domain = LOCALE_TO_DOMAIN[locale];
    if (domain) {
      // Ensure baseUrl starts with locale
      const normalizedBaseUrl = baseUrl.startsWith(`/${locale}`)
        ? baseUrl
        : `/${locale}${baseUrl.startsWith("/") ? "" : "/"}${baseUrl}`;

      hreflangs[locale] =
        `${PROTOCOL}://${domain}${normalizedBaseUrl}${pageParam}`;
    }
  });

  // Set x-default to the default locale (en-SA)
  const defaultDomain = LOCALE_TO_DOMAIN["ar-SA" as Locale];
  hreflangs["x-default"] =
    `${PROTOCOL}://${defaultDomain}${baseUrl}${pageParam}`;

  return hreflangs;
}

/**
 * Generate hreflang tags following Goldenscent structure rules
 * Rules:
 * 1. Include self-referencing hreflang tag
 * 2. Include all equivalent versions (country + language)
 * 3. x-default points to Global equivalent URL (or global homepage if no equivalent exists)
 * 4. Use Global as x-default only (do not add hreflang="en" for Global)
 * 5. Only include hreflang for pages that exist
 *
 * URL Structure:
 * - Arabic pages: https://domain.com/path (no language prefix)
 * - English pages: https://domain.com/en/path (with /en/ prefix)
 * - Global: https://global.goldenscent.com/path (no language prefix, x-default only)
 *
 * Supported countries:
 * - Saudi Arabia: ar-sa, en-sa (www.goldenscent.com)
 * - UAE: ar-ae, en-ae (ae.goldenscent.com)
 * - Kuwait: ar-kw, en-kw (kw.goldenscent.com)
 * - Oman: ar-om (om.goldenscent.com) - Arabic only
 * - Global: x-default only (global.goldenscent.com)
 */
export function generateHreflangTags({
  globalPathname,
  pathname,
  searchParams,
}: {
  globalPathname?: string; // Pathname for global equivalent (defaults to pathname if no equivalent exists)
  pathname: string;
  searchParams?: Record<string, number | string | undefined>;
}): Record<string, string> {
  const hreflangs: Record<string, string> = {};

  // Build query string from searchParams (only page param allowed per rules)
  const pageNumber =
    searchParams?.page !== undefined
      ? typeof searchParams.page === "number"
        ? searchParams.page
        : parseInt(String(searchParams.page), 10)
      : undefined;
  const queryString =
    pageNumber !== undefined && pageNumber > 1 ? `?page=${pageNumber}` : "";

  // Normalize current pathname - remove locale prefix to get base path
  // If pathname already has locale prefix, remove it; otherwise use as-is
  let basePath = pathname;
  if (pathname.startsWith("/en/") || pathname.startsWith("/ar/")) {
    basePath = pathname.replace(/^\/[a-z]{2}/, "") || "/";
  } else if (pathname.startsWith("/")) {
    basePath = pathname;
  } else {
    basePath = `/${pathname}`;
  }

  // Ensure basePath starts with /
  if (!basePath.startsWith("/")) {
    basePath = `/${basePath}`;
  }

  // Define supported country-language pairs according to Goldenscent structure
  const supportedHreflangs = [
    {
      hreflang: "ar-sa",
      locale: "ar-SA" as Locale,
    },
    {
      hreflang: "en-sa",
      locale: "en-SA" as Locale,
    },
    {
      hreflang: "ar-ae",
      locale: "ar-AE" as Locale,
    },
    {
      hreflang: "en-ae",
      locale: "en-AE" as Locale,
    },
    {
      hreflang: "ar-kw",
      locale: "ar-KW" as Locale,
    },
    {
      hreflang: "en-kw",
      locale: "en-KW" as Locale,
    },
    {
      hreflang: "ar-om",
      locale: "ar-OM" as Locale,
    },
    {
      hreflang: "en-om",
      locale: "en-OM" as Locale,
    },
  ];

  // Generate hreflang for each supported country-language pair
  supportedHreflangs.forEach(({ hreflang, locale }) => {
    const domain = LOCALE_TO_DOMAIN[locale];
    if (domain) {
      // Prefix comes from the domain's default locale (as-needed), so this is
      // correct even where the default is inverted (e.g. Global = English).
      const localePath = getCanonicalLocalePrefix(locale);
      const joinedPath = `${localePath}${basePath}`;
      const normalizedPath = joinedPath.replace(/\/+$/, "") || "/";
      const url = `${PROTOCOL}://${domain}${normalizedPath}${queryString}`;
      hreflangs[hreflang] = url;
    }
  });

  // x-default always points to Global equivalent URL — no language prefix.
  // Per Goldenscent rules the global domain uses no /en prefix:
  //   Homepage:  https://global.goldenscent.com/
  //   Product:   https://global.goldenscent.com/p/product-name
  //   Category:  https://global.goldenscent.com/c/perfumes
  const globalDomain = LOCALE_TO_DOMAIN["en-GLOBAL" as Locale];
  if (globalDomain) {
    const globalBasePath =
      globalPathname !== undefined ? globalPathname || "/" : basePath;
    const normalizedPath = globalBasePath.replace(/\/+$/, "") || "/";
    const xDefaultUrl = `${PROTOCOL}://${globalDomain}${normalizedPath}${queryString}`;
    hreflangs["x-default"] = xDefaultUrl;
  }

  return hreflangs;
}

/**
 * Generate prev/next link tags for paginated content
 */
export function generatePaginationLinks({
  baseUrl,
  currentPage,
  totalPages,
}: {
  baseUrl: string;
  currentPage: number;
  totalPages: number;
}): {
  next?: string;
  prev?: string;
} {
  const links: { next?: string; prev?: string } = {};

  if (currentPage > 1) {
    links.prev =
      currentPage === 2 ? baseUrl : `${baseUrl}?page=${currentPage - 1}`;
  }

  if (currentPage < totalPages) {
    links.next = `${baseUrl}?page=${currentPage + 1}`;
  }

  return links;
}

/**
 * Generate JSON-LD structured data for product listings
 * Helps search engines understand the page content
 */
export function generateProductListingStructuredData({
  categoryName,
  products,
  url,
}: {
  categoryName: string;
  products: ProductCardModel[];
  url: string;
}) {
  const structuredData = {
    "@context": "https://schema.org" as const,
    "@type": "ItemList" as const,
    itemListElement: products.slice(0, 20).map((product, index) => ({
      "@type": "ListItem" as const,
      item: {
        "@type": "Product" as const,
        image: product.imageUrl,
        name: product.name,
        offers: {
          "@type": "Offer" as const,
          availability: product.stockStatus
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          price: product.priceValue,
          priceCurrency: product.currency,
        },
        sku: product.sku,
      },
      position: index + 1,
    })),
    name: categoryName,
    numberOfItems: products.length,
    url,
  };

  return structuredData as any;
}

/**
 * Generate robots meta directives for pagination
 */
export function generateRobotsDirective({
  currentPage,
}: {
  currentPage: number;
}): {
  follow: boolean;
  index: boolean;
} {
  return {
    follow: true,
    index: currentPage === 1,
  };
}

/**
 * Get the full domain URL for a given locale
 */
export function getDomainForLocale(locale: Locale): string {
  const domain = LOCALE_TO_DOMAIN[locale];
  return `${PROTOCOL}://${domain}`;
}

/**
 * Get the locale path prefix (e.g., "/en" or "/ar") from the full locale
 */
export function getLocalePrefix(locale: Locale): string {
  // Extract language code from locale (e.g., "en-SA" -> "en", "ar-AE" -> "ar")
  const language = locale.split("-")[0];
  return `/${language}`;
}

/**
 * Get the path prefix a locale actually resolves to under next-intl's
 * `as-needed` mode. Each domain serves its `defaultLocale` WITHOUT a prefix
 * (e.g. Arabic on goldenscent.com, English on global.goldenscent.com), so a
 * canonical/hreflang URL for that locale must be prefix-less too. Every other
 * locale on the domain keeps its /en or /ar prefix.
 *
 * This is why we can't hardcode "Arabic => no prefix": the GLOBAL domain is
 * inverted (English is the default, Arabic gets /ar), so the default locale
 * must be read from the routing config per domain.
 */
export function getCanonicalLocalePrefix(locale: Locale): string {
  const domainConfig = routing.domains?.find((domain) =>
    (domain.locales as readonly Locale[]).includes(locale)
  );

  if (domainConfig?.defaultLocale === locale) {
    return "";
  }

  return getLocalePrefix(locale);
}
