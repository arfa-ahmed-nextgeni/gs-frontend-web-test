import { CategoryFiltersListSkeleton } from "@/components/category/skeletons/category-filters-list-skeleton";
import { CategoryListingProductsSkeleton } from "@/components/category/skeletons/category-listing-products-skeleton";
import { CategoryTypeFilterSkeleton } from "@/components/category/skeletons/category-type-filter-skeleton";
import Container from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrandCategoryPageLoading() {
  return (
    <>
      <Container className="mt-5 hidden w-full lg:flex">
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-12 rounded" />
          <Skeleton className="h-3.5 w-20 rounded" />
          <Skeleton className="h-3.5 w-24 rounded" />
        </div>
      </Container>

      <Container className="mt-5 flex flex-col gap-2.5 lg:mt-10 lg:flex-row">
        <div className="gap-1.25 lg:mt-15 lg:w-47.75 flex w-full flex-col lg:pb-8">
          <CategoryTypeFilterSkeleton />

          <Skeleton className="hidden h-7 rounded-xl lg:block" />

          <CategoryFiltersListSkeleton />
        </div>

        <div className="flex-1">
          <div className="mb-2 ml-2 flex items-center justify-between lg:mb-5 lg:ml-0">
            <Skeleton className="h-8 w-48 rounded" />
            <Skeleton className="hidden h-7 w-32 rounded lg:block" />
          </div>

          <CategoryListingProductsSkeleton />
        </div>
      </Container>
    </>
  );
}
