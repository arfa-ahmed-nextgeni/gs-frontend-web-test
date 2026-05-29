import "server-only";

import { getCategoryRouteListing } from "@/lib/actions/category/get-category-route-listing";
import { getPageLandingData } from "@/lib/actions/contentful/page-landing";
import { getProductsByCategory } from "@/lib/actions/products/get-products-by-category";
import {
  collectCategoryStaticSlugs,
  collectUrlsFromPageLanding,
  DEFAULT_CATEGORY_STATIC_PARAMS_SOURCES,
  extractLpSlugFromUrl,
} from "@/lib/category/static-params-extractors";
import { type Locale } from "@/lib/constants/i18n";
import { ProductCardVariant } from "@/lib/constants/product/product-card";
import { ROUTE_PLACEHOLDER } from "@/lib/constants/routes";
import { CategoryProducts } from "@/lib/models/category-products";
import { FlashSale } from "@/lib/models/flash-sale";
import { TabContentType } from "@/lib/models/page-landing";
import { TopTrendsCategoryProducts } from "@/lib/models/top-trends-category-products";
import { isOk } from "@/lib/utils/service-result";

/**
 * Per-source toggles for product static-params data sources.
 * Disable individual sources to skip generating urlKeys from them.
 */
interface ProductStaticParamsSources {
  categoryFirstPage: boolean;
  landingCategoryProducts: boolean;
  landingFlashSale: boolean;
  landingTopTrends: boolean;
}

const DEFAULT_PRODUCT_STATIC_PARAMS_SOURCES: ProductStaticParamsSources = {
  categoryFirstPage: true,
  landingCategoryProducts: true,
  landingFlashSale: true,
  landingTopTrends: true,
};

interface PageLandingContent {
  contentType: TabContentType;
}

interface PageLandingLike {
  contents?: PageLandingContent[];
}

interface ProductFetchPlan {
  category: string;
  pageSize: number;
  variant: ProductCardVariant;
}

/**
 * Full PDP static-params urlKey collector.
 *
 * The collected category set is the union of:
 *  - categories surfaced via `collectCategoryStaticSlugs` (gated by
 *    `categoryFirstPage`). That helper also warms `getCategoryRouteShell`
 *    via its `shellChildren` cascade — no extra shell-warming needed here.
 *  - categories referenced by landing-page carousel sections
 *    (CategoryProducts / FlashSale / TopTrendsCategoryProducts), gated by
 *    the matching landing flags.
 *
 * Two extraction pipelines run in parallel; each matches the fetcher the
 * runtime page actually uses so the populated cache serves the same
 * payload at runtime:
 *
 * 1. `getCategoryRouteListing` for EVERY referenced category (empty
 *    `search`, default pageSize) — matches what `/c/[...slug]` renders
 *    for the unfiltered first page.
 *
 * 2. `getProductsByCategory` for landing-referenced categories ONLY, with
 *    pageSize = section's `maximumProducts` and the right `variant` —
 *    matches what landing carousels fetch.
 *
 * UrlKeys from both pipelines are deduplicated into one flat list.
 */
export async function collectProductStaticUrlKeys({
  locale,
  sources = DEFAULT_PRODUCT_STATIC_PARAMS_SOURCES,
}: {
  locale: string;
  sources?: ProductStaticParamsSources;
}): Promise<string[]> {
  const landingPlans = new Map<string, ProductFetchPlan>();

  const addPlan = (plan: ProductFetchPlan) => {
    if (!plan.category) return;
    const key = `${plan.category}|${plan.variant}`;
    const existing = landingPlans.get(key);
    if (!existing || existing.pageSize < plan.pageSize) {
      landingPlans.set(key, plan);
    }
  };

  const wantsLandingPlans =
    sources.landingCategoryProducts ||
    sources.landingFlashSale ||
    sources.landingTopTrends;

  if (wantsLandingPlans) {
    const pageLandings = await discoverPageLandings(locale);
    for (const pageLanding of pageLandings) {
      collectLandingProductPlans(pageLanding, addPlan, sources);
    }
  }

  const categoryPagePaths: string[] = [];
  if (sources.categoryFirstPage) {
    const categorySlugs = await collectCategoryStaticSlugs({
      locale,
      sources: {
        ...DEFAULT_CATEGORY_STATIC_PARAMS_SOURCES,
        shellChildren: false,
      },
    });
    for (const slugSegments of categorySlugs) {
      const category = slugSegments.join("/");
      if (!category || category === ROUTE_PLACEHOLDER) continue;
      categoryPagePaths.push(category);
    }
  }

  const allReferencedCategories = new Set<string>([
    ...Array.from(landingPlans.values()).map((plan) => plan.category),
    ...categoryPagePaths,
  ]);

  const urlKeys = new Set<string>();

  await Promise.all([
    // Pipeline 1: getCategoryRouteListing for EVERY referenced category
    // (matches the runtime fetcher of `/c/[...slug]` first page).
    ...Array.from(allReferencedCategories).map(async (category) => {
      const { listingData } = await getCategoryRouteListing({
        categoryPath: category,
        locale: locale as Locale,
        search: {},
      });
      for (const product of listingData.products) {
        if (product.urlKey) {
          urlKeys.add(product.urlKey);
        }
      }
    }),

    // Pipeline 2: getProductsByCategory for landing-referenced categories
    // ONLY (matches what landing-page carousels actually fetch).
    ...Array.from(landingPlans.values()).map(async (plan) => {
      const result = await getProductsByCategory({
        category: plan.category,
        locale: locale as Locale,
        pageSize: plan.pageSize,
        variant: plan.variant,
      });
      if (!isOk(result)) return;
      for (const product of result.data.products) {
        if (product.urlKey) {
          urlKeys.add(product.urlKey);
        }
      }
    }),
  ]);

  return Array.from(urlKeys);
}

/**
 * Emits ProductFetchPlan tuples for CategoryProducts/FlashSale/
 * TopTrendsCategoryProducts content sections within a single page-landing.
 * Each plan carries the section's `maximumProducts` as pageSize.
 */
function collectLandingProductPlans(
  pageLanding: PageLandingLike | undefined,
  addPlan: (plan: ProductFetchPlan) => void,
  sources: ProductStaticParamsSources
) {
  for (const content of pageLanding?.contents || []) {
    switch (content.contentType) {
      case TabContentType.CategoryProducts: {
        if (!sources.landingCategoryProducts) break;
        const cp = content as CategoryProducts;
        addPlan({
          category: cp.productsCategoryId,
          pageSize: cp.maximumProducts || 1,
          variant: cp.variant,
        });
        break;
      }

      case TabContentType.FlashSale: {
        if (!sources.landingFlashSale) break;
        const fs = content as FlashSale;
        addPlan({
          category: fs.productsCategoryId,
          pageSize: fs.maximumProducts || 1,
          variant: fs.variant,
        });
        break;
      }

      case TabContentType.TopTrendsCategoryProducts: {
        if (!sources.landingTopTrends) break;
        const top = content as TopTrendsCategoryProducts;
        addPlan({
          category: top.productsCategoryId,
          pageSize: top.maximumProducts || 1,
          variant: top.variant,
        });
        break;
      }
    }
  }
}

/**
 * Discovers home page-landing + every lp page-landing reachable from its
 * URL graph. Returns flat list of page-landing data for downstream walkers.
 */
async function discoverPageLandings(locale: string) {
  const lpSlugs = new Set<string>();
  const collectLp = (url?: string) => {
    const lp = extractLpSlugFromUrl(url);
    if (lp) lpSlugs.add(lp);
  };

  const home = await getPageLandingData({ locale });
  collectUrlsFromPageLanding(home, collectLp);

  const lpDataList = await Promise.all(
    Array.from(lpSlugs).map((slug) => getPageLandingData({ locale, slug }))
  );

  return [home, ...lpDataList];
}
