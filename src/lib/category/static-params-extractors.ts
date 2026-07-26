import "server-only";

import { getBrands } from "@/lib/actions/category/get-brands";
import { getCategoryRouteShell } from "@/lib/actions/category/get-category-route-shell";
import { getPageLandingData } from "@/lib/actions/contentful/page-landing";
import { type Locale } from "@/lib/constants/i18n";
import { INFO_PAGE_SLUGS } from "@/lib/constants/pages";
import { ROUTE_PLACEHOLDER } from "@/lib/constants/routes";
import { BannerSlider } from "@/lib/models/banner-slider";
import { CategoryProducts } from "@/lib/models/category-products";
import { DesktopCategories } from "@/lib/models/desktop-categories";
import { FlashSale } from "@/lib/models/flash-sale";
import { TabContentType } from "@/lib/models/page-landing";
import { TopTrendsCategoryProducts } from "@/lib/models/top-trends-category-products";
import { WebsiteBanner } from "@/lib/models/website-banner";
import { WebsiteMultipleBanners } from "@/lib/models/website-multiple-banners";
import { isOk } from "@/lib/utils/service-result";

/**
 * Top-level toggles for category generateStaticParams data sources.
 * Each field independently controls whether that source contributes slugs.
 */
interface CategoryStaticParamsSources {
  brands: boolean;
  homePageLanding: boolean;
  lpPageLanding: boolean;
  pageLanding: PageLandingExtractionSources;
  shellChildren: boolean;
}

/**
 * Per-source toggles for content extracted from a single PageLanding entry.
 * Disable a source to skip generating slugs from it.
 */
interface PageLandingExtractionSources {
  bannerSlider: boolean;
  categoryProducts: boolean;
  desktopCategories: boolean;
  flashSale: boolean;
  promoBanner: boolean;
  siteNavigation: boolean;
  topTrendsBanners: boolean;
  topTrendsCategoryId: boolean;
  websiteBanner: boolean;
  websiteMultipleBanner: boolean;
}

const DEFAULT_PAGE_LANDING_EXTRACTION_SOURCES: PageLandingExtractionSources = {
  bannerSlider: false,
  categoryProducts: false,
  desktopCategories: false,
  flashSale: false,
  promoBanner: false,
  siteNavigation: false,
  topTrendsBanners: false,
  topTrendsCategoryId: false,
  websiteBanner: false,
  websiteMultipleBanner: false,
};

export const DEFAULT_CATEGORY_STATIC_PARAMS_SOURCES: CategoryStaticParamsSources =
  {
    brands: false,
    homePageLanding: false,
    lpPageLanding: false,
    pageLanding: DEFAULT_PAGE_LANDING_EXTRACTION_SOURCES,
    shellChildren: false,
  };

/**
 * Single-segment `/c/` slugs the catch-all `/c/[...slug]` must NOT
 * prerender. `brands` is served by its own top-level page at
 * `src/app/[locale]/brands/page.tsx` (URL `/brands`), so prerendering
 * `/c/brands` here would only produce a duplicate of the brands landing.
 * Multi-segment descendants (e.g. `/c/brands/{brand-slug}`) still belong
 * to the catch-all and stay.
 */
const RESERVED_LITERAL_C_SLUGS = new Set<string>(["brands"]);

interface NavItem {
  path: string;
  subMenu?: NavItem[];
}

interface PageLandingLike {
  contents?: Array<{ contentType: TabContentType }>;
  promoBanner?: { url?: string };
  siteNavigation?: { items?: NavItem[] };
}

/**
 * Full category static-params slug collector. Walks home page-landing +
 * lp page-landings + brands + child categories of fetched shells.
 * Each source is independently toggleable via `sources`.
 *
 * Reusable for other route static-params (e.g. product page).
 */
export async function collectCategoryStaticSlugs({
  locale,
  sources = DEFAULT_CATEGORY_STATIC_PARAMS_SOURCES,
}: {
  locale: string;
  sources?: CategoryStaticParamsSources;
}): Promise<string[][]> {
  const categorySlugs = new Map<string, string[]>([
    [ROUTE_PLACEHOLDER, [ROUTE_PLACEHOLDER]],
  ]);
  const lpSlugs = new Set<string>();

  const addCategorySlug = (url?: string) => {
    const slug = extractCategorySlugFromUrl(url);
    if (!slug) return;
    // Skip single-segment slugs owned by dedicated literal routes
    // (e.g. `/c/brands` has its own page.tsx). Multi-segment children
    // still belong to the catch-all and pass through.
    if (
      slug.length === 1 &&
      RESERVED_LITERAL_C_SLUGS.has(slug[0]!.toLowerCase())
    ) {
      return;
    }
    categorySlugs.set(slug.join("/"), slug);
  };

  const addLpSlug = (url?: string) => {
    const slug = extractLpSlugFromUrl(url);
    if (slug) {
      lpSlugs.add(slug);
    }
  };

  const visit = (url?: string) => {
    addCategorySlug(url);
    addLpSlug(url);
  };

  if (sources.homePageLanding) {
    const homeData = await getPageLandingData({ locale });
    collectUrlsFromPageLanding(homeData, visit, sources.pageLanding);
  }

  if (sources.lpPageLanding) {
    const lpDataList = await Promise.all(
      Array.from(lpSlugs).map((slug) => getPageLandingData({ locale, slug }))
    );
    for (const lpData of lpDataList) {
      collectUrlsFromPageLanding(lpData, addCategorySlug, sources.pageLanding);
    }
  }

  if (sources.brands) {
    const brandsResult = await getBrands({ locale: locale as Locale });
    if (isOk(brandsResult)) {
      for (const letterBrands of Object.values(brandsResult.data)) {
        for (const brand of letterBrands) {
          addCategorySlug(`/c/brands/${brand.urlKey}`);
        }
      }
    }
  }

  if (sources.shellChildren) {
    const baseSlugs = Array.from(categorySlugs.values()).filter(
      (slug) => slug[0] !== ROUTE_PLACEHOLDER
    );
    const routeShellResults = await Promise.all(
      baseSlugs.map((slug) =>
        getCategoryRouteShell({ locale: locale as Locale, slug })
      )
    );
    for (const result of routeShellResults) {
      if (!isOk(result)) continue;
      for (const child of result.data.category.children || []) {
        const childPath = child.url_path || child.url_key;
        if (childPath) {
          addCategorySlug(`/c/${childPath}`);
        }
      }
    }
  }

  return Array.from(categorySlugs.values());
}

/**
 * Walks a PageLanding entry and calls `visit(url)` for every URL produced
 * by the enabled sources. URLs are raw (may be undefined/empty). Caller
 * is responsible for slug extraction + dedupe.
 *
 * For category-id fields (productsCategoryId on CategoryProducts/FlashSale/
 * TopTrendsCategoryProducts), the slug is normalized to `/c/${id}` so the
 * downstream URL parser can extract it the same way as href fields.
 */
export function collectUrlsFromPageLanding(
  pageLandingData: PageLandingLike | undefined,
  visit: (url?: string) => void,
  sources: PageLandingExtractionSources = DEFAULT_PAGE_LANDING_EXTRACTION_SOURCES
) {
  for (const content of pageLandingData?.contents || []) {
    switch (content.contentType) {
      case TabContentType.BannerSlider:
        if (!sources.bannerSlider) break;
        for (const banner of (content as BannerSlider).items) {
          visit(banner.btnUrl);
        }
        break;

      case TabContentType.CategoryProducts: {
        if (!sources.categoryProducts) break;
        const cp = content as CategoryProducts;
        if (cp.productsCategoryId) {
          visit(`/c/${cp.productsCategoryId}`);
        }
        break;
      }

      case TabContentType.DesktopCategories:
        if (!sources.desktopCategories) break;
        for (const category of (content as DesktopCategories).categories) {
          visit(category.url);
        }
        break;

      case TabContentType.FlashSale: {
        if (!sources.flashSale) break;
        const fs = content as FlashSale;
        if (fs.productsCategoryId) {
          visit(`/c/${fs.productsCategoryId}`);
        }
        break;
      }

      case TabContentType.TopTrendsCategoryProducts: {
        const top = content as TopTrendsCategoryProducts;
        if (sources.topTrendsBanners) {
          for (const image of [
            ...(top.desktopBannerImages ?? []),
            ...(top.mobileBannerImages ?? []),
          ]) {
            visit(image.redirectUrl);
          }
        }
        if (sources.topTrendsCategoryId && top.productsCategoryId) {
          visit(`/c/${top.productsCategoryId}`);
        }
        break;
      }

      case TabContentType.WebsiteBanner:
        if (!sources.websiteBanner) break;
        visit((content as WebsiteBanner).url);
        break;

      case TabContentType.WebsiteMultipleBanner:
        if (!sources.websiteMultipleBanner) break;
        for (const banner of (content as WebsiteMultipleBanners).banners) {
          visit(banner.url);
        }
        break;
    }
  }

  if (sources.promoBanner) {
    visit(pageLandingData?.promoBanner?.url);
  }

  if (sources.siteNavigation) {
    collectNavigationUrls(pageLandingData?.siteNavigation?.items, visit);
  }
}

export function extractLpSlugFromUrl(url?: string): null | string {
  const segments = getUrlSegments(url);
  if (!segments) return null;

  const lpSegmentIndex = segments.findIndex(
    (segment) => segment.toLowerCase() === "lp"
  );
  if (lpSegmentIndex === -1) return null;

  const slug = segments[lpSegmentIndex + 1];
  if (!slug) return null;

  const normalizedSlug = decodeURIComponent(slug).trim();
  if (
    !normalizedSlug ||
    normalizedSlug === ROUTE_PLACEHOLDER ||
    INFO_PAGE_SLUGS.includes(normalizedSlug)
  ) {
    return null;
  }

  return normalizedSlug;
}

function collectNavigationUrls(
  items: NavItem[] | undefined,
  visit: (url?: string) => void
) {
  if (!items?.length) return;

  for (const item of items) {
    visit(item.path);
    collectNavigationUrls(item.subMenu, visit);
  }
}

function extractCategorySlugFromUrl(url?: string): null | string[] {
  const segments = getUrlSegments(url);
  if (!segments) return null;

  const cIndex = segments.findIndex((segment) => segment.toLowerCase() === "c");
  if (cIndex === -1) return null;

  const slugSegments = segments
    .slice(cIndex + 1)
    .map((segment) => decodeURIComponent(segment).trim())
    .filter(Boolean);

  if (!slugSegments.length) return null;

  return slugSegments;
}

function getUrlSegments(url?: string): null | string[] {
  if (!url?.trim()) return null;

  let pathname = url.trim();
  try {
    pathname = new URL(pathname, "https://goldenscent.com").pathname;
  } catch {
    return null;
  }

  return pathname
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
}
