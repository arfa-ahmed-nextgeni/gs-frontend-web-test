import { getTranslations } from "next-intl/server";

import { CategorySortByFilter } from "@/components/category/filters/category-sort-by-filter";
import { DynamicCategoryFilterSection } from "@/components/category/filters/dynamic-category-filter-section";
import { MobileStickyFiltersWrapper } from "@/components/category/mobile-sticky-filters-wrapper";
import { CategoryProductsSection } from "@/components/category/products/category-products-section";
import { StickyResultsCounter } from "@/components/search/sticky-results-counter";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import Container from "@/components/shared/container";
import { getSearchRouteListing } from "@/lib/actions/search/get-search-route-listing";
import { type Locale } from "@/lib/constants/i18n";
import { type ProductCardModel } from "@/lib/models/product-card-model";
import { generateProductListingStructuredData } from "@/lib/utils/seo";

interface SearchPageDataSectionProps {
  locale: Locale;
  routePath: string;
  search: Record<string, string | string[] | undefined>;
  searchTerm: string;
}

interface SearchPageStructuredDataProps {
  products: ProductCardModel[];
  routePath: string;
  searchTerm: string;
}

export async function SearchPageDataSection({
  locale,
  routePath,
  search,
  searchTerm,
}: SearchPageDataSectionProps) {
  const { listingData, queryState } = await getSearchRouteListing({
    locale,
    search,
  });

  const tSearch = await getTranslations("search");

  return (
    <>
      <SearchPageStructuredData
        products={listingData.products}
        routePath={routePath}
        searchTerm={searchTerm}
      />

      <MobileStickyFiltersWrapper
        dynamicFilters={listingData.dynamicFilters}
        priceBounds={listingData.priceBounds}
      />

      <Container className="mt-5 flex flex-col gap-2.5 lg:flex-row">
        <DynamicCategoryFilterSection
          filters={listingData.dynamicFilters}
          priceBounds={listingData.priceBounds}
        />

        <div className="flex-1">
          <div className="mb-2 ml-2 flex flex-col items-start justify-between lg:mb-5 lg:ml-0 lg:flex-row lg:items-center">
            <div className="flex flex-col lg:flex-row lg:items-center">
              <h1 className="text-text-primary whitespace-nowrap text-lg font-normal lg:text-[25px]">
                <span className="hidden lg:inline">{tSearch("title")} - </span>
                <span className="text-lg lg:text-[25px]">{searchTerm}</span>
              </h1>
              <span className="mx-1 hidden whitespace-nowrap text-sm font-medium text-[#5D5D5D] underline lg:ml-2 lg:mt-2 lg:block">
                {tSearch("showingResults", {
                  count: String(listingData.totalCount || 0),
                })}
              </span>
            </div>
            <CategorySortByFilter />
          </div>

          <CategoryProductsSection
            categoryPath="search"
            categoryUid="search"
            currentPage={queryState.currentPage}
            products={listingData.products}
            searchTerm={searchTerm}
            totalCount={listingData.totalCount}
            totalPages={listingData.totalPages}
          />
        </div>
      </Container>

      <StickyResultsCounter count={String(listingData.totalCount || 0)} />
    </>
  );
}

function SearchPageStructuredData({
  products,
  routePath,
  searchTerm,
}: SearchPageStructuredDataProps) {
  const productListingSchema = generateProductListingStructuredData({
    categoryName: `Search results for "${searchTerm}"`,
    products,
    url: routePath,
  });

  return <JsonLdScript data={productListingSchema} id="search-schema" />;
}
