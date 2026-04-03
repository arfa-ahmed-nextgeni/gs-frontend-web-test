import { CategorySortByFilter } from "@/components/category/filters/category-sort-by-filter";
import { DynamicCategoryFilterSection } from "@/components/category/filters/dynamic-category-filter-section";
import { MobileStickyFiltersWrapper } from "@/components/category/mobile-sticky-filters-wrapper";
import { CategoryProductsSection } from "@/components/category/products/category-products-section";
import { StickyResultsCounter } from "@/components/search/sticky-results-counter";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import Container from "@/components/shared/container";
import { getCategoryRouteListing } from "@/lib/actions/category/get-category-route-listing";
import { type Locale } from "@/lib/constants/i18n";
import { type CategoryListingModel } from "@/lib/models/category-listing-model";
import { generateBreadcrumbSchema } from "@/lib/utils/schema";
import { generateProductListingStructuredData } from "@/lib/utils/seo";

import type {
  Category,
  CategoryBreadcrumb,
} from "@/lib/types/category-route-data";

export interface CategoryPageDataSectionProps {
  breadcrumbs: CategoryBreadcrumb[];
  category: Category;
  categoryPath: string;
  locale: Locale;
  routePath: string;
  search: Record<string, string | string[] | undefined>;
}

interface CategoryPageStructuredDataProps {
  breadcrumbs: CategoryBreadcrumb[];
  categoryName: string;
  locale: Locale;
  products: CategoryListingModel["products"];
  routePath: string;
}

export async function CategoryPageDataSection({
  breadcrumbs,
  category,
  categoryPath,
  locale,
  routePath,
  search,
}: CategoryPageDataSectionProps) {
  const { listingData, queryState } = await getCategoryRouteListing({
    categoryPath,
    locale,
    search,
  });
  const { currentPage, searchTerm } = queryState;

  return (
    <>
      <CategoryPageStructuredData
        breadcrumbs={breadcrumbs}
        categoryName={category.name || ""}
        locale={locale}
        products={listingData.products}
        routePath={routePath}
      />

      <MobileStickyFiltersWrapper
        dynamicFilters={listingData.dynamicFilters}
        priceBounds={listingData.priceBounds}
      />

      <Container className="mt-5 flex flex-col gap-2.5 lg:flex-row">
        <DynamicCategoryFilterSection
          breadcrumbs={breadcrumbs}
          categoryChildren={
            category.children?.map((child) => ({
              name: child.name,
              product_count: child.product_count,
              uid: child.uid,
              url_key: child.url_key,
              url_path: child.url_path,
            })) ?? []
          }
          currentCategory={{
            name: category.name,
            product_count: category.product_count,
            uid: category.uid,
            url_key: category.url_key,
            url_path: category.url_path,
          }}
          filters={listingData.dynamicFilters}
          priceBounds={listingData.priceBounds}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-2 ml-2 flex min-w-0 items-center justify-between gap-2 lg:mb-5 lg:ml-0">
            <h1 className="text-text-primary min-w-0 flex-1 whitespace-normal break-words text-2xl font-normal lg:text-2xl">
              {category.name}
            </h1>
            <div className="shrink-0">
              <CategorySortByFilter />
            </div>
          </div>

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
        </div>
      </Container>

      <StickyResultsCounter count={String(listingData.totalCount || 0)} />
    </>
  );
}

function CategoryPageStructuredData({
  breadcrumbs,
  categoryName,
  locale,
  products,
  routePath,
}: CategoryPageStructuredDataProps) {
  const productListingSchema = generateProductListingStructuredData({
    categoryName,
    products,
    url: routePath,
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: breadcrumbs.map((breadcrumb) => ({
      name: breadcrumb.title,
      url: breadcrumb.href,
    })),
    locale,
  });

  return (
    <JsonLdScript
      data={[breadcrumbSchema, productListingSchema]}
      id="category-schema"
    />
  );
}
