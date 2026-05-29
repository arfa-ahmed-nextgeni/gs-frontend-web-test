import { DynamicCategoryFilterSection } from "@/components/category/filters/dynamic-category-filter-section";
import { MobileStickyFiltersWrapper } from "@/components/category/mobile-sticky-filters-wrapper";
import { CategoryProductsSection } from "@/components/category/products/category-products-section";
import { StickyResultsCounter } from "@/components/search/sticky-results-counter";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { getCategoryRouteListing } from "@/lib/actions/category/get-category-route-listing";
import { type Locale } from "@/lib/constants/i18n";
import { generateProductListingStructuredData } from "@/lib/utils/seo";

import type { Category } from "@/lib/types/category-route-data";

interface CategoryListingExtrasProps {
  categoryName: string;
  listingPromise: CategoryListingPromise;
  routePath: string;
}

interface CategoryListingProductsProps {
  category: Category;
  categoryPath: string;
  listingPromise: CategoryListingPromise;
}

type CategoryListingPromise = ReturnType<typeof createCategoryListingPromise>;

interface CreateCategoryListingPromiseArgs {
  categoryPath: string;
  locale: Locale;
  searchParamsPromise: Promise<Record<string, string | string[] | undefined>>;
}

interface ListingConsumerProps {
  listingPromise: CategoryListingPromise;
}

export async function CategoryFiltersList({
  listingPromise,
}: ListingConsumerProps) {
  const { listingData } = await listingPromise;

  return (
    <DynamicCategoryFilterSection
      filters={listingData.dynamicFilters}
      priceBounds={listingData.priceBounds}
    />
  );
}

export async function CategoryListingExtras({
  categoryName,
  listingPromise,
  routePath,
}: CategoryListingExtrasProps) {
  const { listingData } = await listingPromise;
  const productListingSchema = generateProductListingStructuredData({
    categoryName,
    products: listingData.products,
    url: routePath,
  });

  return (
    <>
      <StickyResultsCounter count={String(listingData.totalCount || 0)} />
      <JsonLdScript data={productListingSchema} id="category-listing-schema" />
    </>
  );
}

export async function CategoryListingProducts({
  category,
  categoryPath,
  listingPromise,
}: CategoryListingProductsProps) {
  const { listingData, queryState } = await listingPromise;
  const { currentPage, searchTerm } = queryState;

  return (
    <CategoryProductsSection
      categoryId={category.id}
      categoryMetadata={{
        name: category.name || "",
        uid: category.uid,
        urlPath: categoryPath,
      }}
      categoryPath={categoryPath}
      categoryUid={category.uid}
      currentPage={currentPage}
      products={listingData.products}
      searchTerm={searchTerm}
      totalCount={listingData.totalCount}
      totalPages={listingData.totalPages}
    />
  );
}

export async function CategoryMobileStickyFilters({
  listingPromise,
}: ListingConsumerProps) {
  const { listingData } = await listingPromise;

  return (
    <MobileStickyFiltersWrapper
      dynamicFilters={listingData.dynamicFilters}
      priceBounds={listingData.priceBounds}
    />
  );
}

/**
 * Creates a single shared promise resolving to category listing data.
 * Awaiting `searchParamsPromise` is deferred until a consumer awaits this
 * promise, so the caller (page) can stay static-prerenderable.
 */
export async function createCategoryListingPromise({
  categoryPath,
  locale,
  searchParamsPromise,
}: CreateCategoryListingPromiseArgs) {
  const search = await searchParamsPromise;
  return getCategoryRouteListing({ categoryPath, locale, search });
}
