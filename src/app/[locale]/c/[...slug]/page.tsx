import { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryPageClientWrapper } from "@/components/category/category-page-client-wrapper";
import { CategoryPageDataSection } from "@/components/category/category-page-data-section";
import { DesktopBreadcrumb } from "@/components/shared/breadcrumb/desktop-breadcrumb";
import { MobileTopBarTitleSync } from "@/components/shared/mobile-top-bar-title-sync";
import { getCategoryRouteListing } from "@/lib/actions/category/get-category-route-listing";
import { getCategoryRouteShell } from "@/lib/actions/category/get-category-route-shell";
import { type Locale } from "@/lib/constants/i18n";
import { initializePageLocale } from "@/lib/utils/locale";
import {
  generateAbsoluteCanonicalUrl,
  generateHreflangTags,
  generatePaginationLinks,
  generateRobotsDirective,
} from "@/lib/utils/seo";
import { isOk } from "@/lib/utils/service-result";

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/[locale]/c/[...slug]">) {
  const resolvedSearchParams = await searchParams;
  const { locale, slug } = await params;

  initializePageLocale(locale);

  const routeShellResult = await getCategoryRouteShell({
    locale: locale as Locale,
    slug,
  });

  if (!isOk(routeShellResult)) {
    // Only sends user to 404 for that specific error.
    if (routeShellResult.error === "Category not found") {
      notFound();
    }

    throw new Error(routeShellResult.error);
  }

  const routeShell = routeShellResult.data;

  return (
    <CategoryPageClientWrapper
      category={{
        "category.id": routeShell.category.id
          ? routeShell.category.id.toString()
          : "",
        "category.level": routeShell.category.level,
        "category.name": routeShell.category.name || "",
        ...(routeShell.categoryPath && {
          "category.english_name": routeShell.categoryPath,
        }),
      }}
    >
      <MobileTopBarTitleSync title={routeShell.category.name || ""} />

      <DesktopBreadcrumb
        items={routeShell.breadcrumbs.slice(0, -1)}
        routeTitle={
          routeShell.breadcrumbs.slice(-1)[0]?.title || routeShell.category.name
        }
      />

      <CategoryPageDataSection
        breadcrumbs={routeShell.breadcrumbs}
        category={routeShell.category}
        categoryPath={routeShell.categoryPath}
        locale={locale as Locale}
        routePath={routeShell.routePath}
        search={resolvedSearchParams}
      />
    </CategoryPageClientWrapper>
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/[locale]/c/[...slug]">): Promise<Metadata> {
  const search = await searchParams;
  const { locale, slug } = await params;

  const routeShellResult = await getCategoryRouteShell({
    locale: locale as Locale,
    slug,
  });

  if (!isOk(routeShellResult)) {
    return {
      description: "The requested category could not be found.",
      title: "Category Not Found",
    };
  }
  const routeShell = routeShellResult.data;

  const { listingData, queryState } = await getCategoryRouteListing({
    categoryPath: routeShell.categoryPath,
    locale: locale as Locale,
    search,
  });
  const currentPage = queryState.currentPage;

  const firstProductImage =
    listingData.productResponse.items?.[0]?.productView?.images?.[0]?.url;

  const categoryPathLabel = Array.isArray(slug) ? slug.join(" > ") : slug;
  const baseTitle = routeShell.category.meta_title || routeShell.category.name;
  const pageTitle =
    currentPage > 1
      ? `${baseTitle} - Page ${currentPage}`
      : routeShell.category.meta_title ||
        `${routeShell.category.name} - ${categoryPathLabel}`;

  const description =
    routeShell.category.meta_description ||
    `Browse ${routeShell.category.name} products - ${categoryPathLabel}`;

  const canonical = generateAbsoluteCanonicalUrl({
    locale: locale as Locale,
    pathname: routeShell.routePath,
  });

  const robots = generateRobotsDirective({ currentPage });

  const paginationLinks = generatePaginationLinks({
    baseUrl: routeShell.routePath,
    currentPage,
    totalPages: listingData.totalPages,
  });

  const hreflangs = generateHreflangTags({
    pathname: routeShell.routePath,
    searchParams: currentPage > 1 ? { page: currentPage } : undefined,
  });

  const ogImage = firstProductImage || `${canonical}/logo-512x512.png`;

  return {
    alternates: {
      canonical,
      languages: hreflangs,
    },
    description,
    ...(routeShell.category.meta_keywords && {
      keywords: routeShell.category.meta_keywords,
    }),
    openGraph: {
      description,
      images: [
        {
          alt: routeShell.category.name || "Category",
          height: 800,
          url: ogImage,
          width: 800,
        },
      ],
      locale,
      siteName: "Golden Scent",
      title: pageTitle,
      type: "website",
      url: canonical,
    },
    other: {
      ...(paginationLinks.next && { next: paginationLinks.next }),
      ...(paginationLinks.prev && { prev: paginationLinks.prev }),
    },
    robots,
    title: pageTitle,
    twitter: {
      card: "summary_large_image",
      description,
      images: [ogImage],
      title: pageTitle,
    },
  };
}

export function generateStaticParams() {
  const commonCategories = ["fragrances", "beauty", "new", "best-sellers"];

  return commonCategories.map((category) => ({ slug: [category] }));
}
