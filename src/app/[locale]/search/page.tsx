import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getTranslations } from "next-intl/server";

import { SearchTracker } from "@/components/analytics/search-tracker";
import { SearchPageClientWrapper } from "@/components/search/search-page-client-wrapper";
import { SearchPageDataSection } from "@/components/search/search-page-data-section";
import { DesktopBreadcrumb } from "@/components/shared/breadcrumb/desktop-breadcrumb";
import { getSearchRouteListing } from "@/lib/actions/search/get-search-route-listing";
import { Locale } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import { resolveProductImageUrl } from "@/lib/utils/image";
import { initializePageLocale } from "@/lib/utils/locale";
import {
  generateAbsoluteCanonicalUrl,
  generateRobotsDirective,
} from "@/lib/utils/seo";

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/[locale]/search">): Promise<Metadata> {
  const { locale } = await params;
  const search = await searchParams;

  const { listingData, queryState } = await getSearchRouteListing({
    locale: locale as Locale,
    search,
  });

  if (!queryState.searchTerm) {
    return {
      title: "Search",
    };
  }

  const searchTerm = queryState.searchTerm;
  const currentPage = queryState.currentPage;
  const title = `Search results for "${searchTerm}"`;
  const description = `Find the best products matching "${searchTerm}"`;

  const canonicalUrl = generateAbsoluteCanonicalUrl({
    locale: locale as Locale,
    pathname: ROUTES.SEARCH,
    searchParams: {
      page: currentPage > 1 ? currentPage : undefined,
      q: searchTerm,
    },
  });

  const firstProductImage = resolveProductImageUrl(
    listingData.productResponse.items?.[0]?.productView?.images?.[0]?.url
  );
  const ogImage = firstProductImage || `${canonicalUrl}/logo-512x512.png`;

  return {
    alternates: {
      // Rule: do not add hreflang to search result pages
      canonical: canonicalUrl,
    },
    description,
    openGraph: {
      description,
      images: [
        {
          height: 630,
          url: ogImage,
          width: 1200,
        },
      ],
      locale,
      siteName: "Golden Scent",
      title,
      type: "website",
      url: canonicalUrl,
    },
    robots: generateRobotsDirective({ currentPage }),
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [ogImage],
      title,
    },
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: PageProps<"/[locale]/search">) {
  const { locale } = await params;

  initializePageLocale(locale);

  const resolvedSearchParams = await searchParams;
  const searchTerm = Array.isArray(resolvedSearchParams.q)
    ? resolvedSearchParams.q[0]
    : resolvedSearchParams.q;

  if (!searchTerm) {
    notFound();
  }

  const tSearch = await getTranslations("search");
  const breadcrumbs = [
    { href: "/", title: tSearch("breadcrumb.home") },
    {
      href: `${ROUTES.SEARCH}?q=${encodeURIComponent(searchTerm)}`,
      title: tSearch("breadcrumb.search"),
    },
  ];

  const routePath = `${ROUTES.SEARCH}?q=${encodeURIComponent(searchTerm)}`;

  return (
    <SearchPageClientWrapper>
      <SearchTracker asCatalogView trackInit />

      <DesktopBreadcrumb
        items={breadcrumbs.slice(0, -1)}
        routeTitle={breadcrumbs.slice(-1)[0].title}
      />

      <SearchPageDataSection
        locale={locale as Locale}
        routePath={routePath}
        search={resolvedSearchParams}
        searchTerm={searchTerm}
      />
    </SearchPageClientWrapper>
  );
}
