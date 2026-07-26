import { Suspense } from "react";

import { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryListingRedirectGuard } from "@/components/category/category-listing-redirect-guard";
import {
  CategoryFiltersList,
  CategoryListingExtras,
  CategoryListingProducts,
  CategoryMobileStickyFilters,
  createCategoryListingPromise,
} from "@/components/category/category-listing-regions";
import { CategoryPageClientWrapper } from "@/components/category/category-page-client-wrapper";
import { CategorySortByFilter } from "@/components/category/filters/category-sort-by-filter";
import { CategoryTypeFilter } from "@/components/category/filters/category-type-filter";
import { FilterSectionHeader } from "@/components/category/filters/filter-section-header";
import { CategoryFiltersListSkeleton } from "@/components/category/skeletons/category-filters-list-skeleton";
import { CategoryListingProductsSkeleton } from "@/components/category/skeletons/category-listing-products-skeleton";
import { AsyncBoundary } from "@/components/common/async-boundary";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { DesktopBreadcrumb } from "@/components/shared/breadcrumb/desktop-breadcrumb";
import Container from "@/components/shared/container";
import { MobileTopBarTitleSync } from "@/components/shared/mobile-top-bar-title-sync";
import { redirect } from "@/i18n/navigation";
import { getCategoryRouteListing } from "@/lib/actions/category/get-category-route-listing";
import { getCategoryRouteShell } from "@/lib/actions/category/get-category-route-shell";
import { getCategoryListingHrefIfPageExceedsProductCap } from "@/lib/category/category-listing-redirect";
import { CATEGORY_LISTING_DEFAULT_PAGE_SIZE } from "@/lib/constants/category/category-listing-cap";
import { type Locale } from "@/lib/constants/i18n";
import { ROUTE_PLACEHOLDER } from "@/lib/constants/routes";
import { resolveProductImageUrl } from "@/lib/utils/image";
import { initializePageLocale } from "@/lib/utils/locale";
import { isProductionBuild } from "@/lib/utils/next-phase";
import { generateBreadcrumbSchema } from "@/lib/utils/schema";
import {
  generateAbsoluteCanonicalUrl,
  generateHreflangTags,
  generatePaginationLinks,
  generateRobotsDirective,
} from "@/lib/utils/seo";
import { isOk } from "@/lib/utils/service-result";

type CategoryRouteArgs = {
  locale: string;
  searchParams: CategoryRouteSearchParams;
  slug: string[];
};

type CategoryRouteSearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export async function buildCategoryRouteMetadata({
  locale,
  searchParams,
  slug,
}: CategoryRouteArgs): Promise<Metadata> {
  const search = await searchParams;

  if (slug[0] === ROUTE_PLACEHOLDER) {
    return {
      description: "The requested category could not be found.",
      title: "Category Not Found",
    };
  }

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

  const categoryListingRedirectHref =
    getCategoryListingHrefIfPageExceedsProductCap(
      routeShell.routePath,
      search,
      CATEGORY_LISTING_DEFAULT_PAGE_SIZE
    );
  if (categoryListingRedirectHref) {
    redirect({ href: categoryListingRedirectHref, locale });
  }

  const { listingData, queryState } = await getCategoryRouteListing({
    categoryPath: routeShell.categoryPath,
    locale: locale as Locale,
    search,
  });
  const currentPage = queryState.currentPage;

  const firstProductImage = resolveProductImageUrl(
    listingData.productResponse.items?.[0]?.productView?.images?.[0]?.url
  );

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

  // Rule: hreflang URLs must not include query parameters — always point to page 1.
  const hreflangs = generateHreflangTags({
    pathname: routeShell.routePath,
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

/**
 * Shared category route rendering + metadata, used by both `/c/[...slug]`
 * and `/brands/[...slug]`. The two routes differ only in the slug they
 * resolve (brands prepends `brands`) and the route prefix their canonical
 * URLs use — both handled upstream via `categoryUrlPathToRoutePath`.
 */
export async function CategoryRouteContent({
  locale,
  searchParams,
  slug,
}: CategoryRouteArgs) {
  initializePageLocale(locale);

  if (slug[0] === ROUTE_PLACEHOLDER) {
    notFound();
  }

  const routeShellResult = await getCategoryRouteShell({
    locale: locale as Locale,
    slug,
  });

  if (!isOk(routeShellResult)) {
    // Only sends user to 404 for that specific error.
    if (routeShellResult.error === "Category not found") {
      notFound();
    }

    if (isProductionBuild()) {
      return null;
    }

    throw new Error(routeShellResult.error);
  }

  const routeShell = routeShellResult.data;

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: routeShell.breadcrumbs.map((breadcrumb) => ({
      name: breadcrumb.title,
      url: breadcrumb.href,
    })),
    locale: locale as Locale,
  });

  const listingPromise = createCategoryListingPromise({
    categoryPath: routeShell.categoryPath,
    locale: locale as Locale,
    searchParamsPromise: searchParams,
  });

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

      <JsonLdScript data={breadcrumbSchema} id="category-breadcrumb-schema" />

      <Suspense fallback={null}>
        <CategoryListingRedirectGuard
          locale={locale as Locale}
          routePath={routeShell.routePath}
          searchParamsPromise={searchParams}
        />
      </Suspense>

      <Container className="mt-5 flex flex-col gap-2.5 lg:flex-row">
        <div className="gap-1.25 lg:mt-15 lg:w-47.75 flex w-full flex-col lg:pb-8">
          <CategoryTypeFilter
            breadcrumbs={routeShell.breadcrumbs}
            category={routeShell.category}
          />
          <FilterSectionHeader />
          <AsyncBoundary fallback={<CategoryFiltersListSkeleton />}>
            <CategoryFiltersList listingPromise={listingPromise} />
          </AsyncBoundary>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 ml-2 flex min-w-0 items-center justify-between gap-2 lg:mb-5 lg:ml-0">
            <h1 className="text-text-primary wrap-break-word min-w-0 flex-1 whitespace-normal text-2xl font-normal lg:text-2xl">
              {routeShell.category.name}
            </h1>
            <div className="shrink-0">
              <CategorySortByFilter />
            </div>
          </div>

          <AsyncBoundary fallback={<CategoryListingProductsSkeleton />}>
            <CategoryListingProducts
              category={routeShell.category}
              categoryPath={routeShell.categoryPath}
              listingPromise={listingPromise}
            />
          </AsyncBoundary>
        </div>
      </Container>

      <AsyncBoundary fallback={null}>
        <CategoryMobileStickyFilters listingPromise={listingPromise} />
      </AsyncBoundary>

      <AsyncBoundary fallback={null}>
        <CategoryListingExtras
          categoryName={routeShell.category.name || ""}
          listingPromise={listingPromise}
          routePath={routeShell.routePath}
        />
      </AsyncBoundary>
    </CategoryPageClientWrapper>
  );
}
