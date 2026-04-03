import { MobileCategoryProductsSkeleton } from "@/components/category/skeletons/mobile-category-products-skeleton";
import { ProductGridSkeleton } from "@/components/category/skeletons/product-grid-skeleton";
import Container from "@/components/shared/container";

export default function SearchPageLoading() {
  return (
    <>
      <Container className="mt-5 hidden w-full lg:flex">
        <div className="flex items-center gap-1">
          <div className="h-3.5 w-12 animate-pulse rounded bg-gray-200" />
          <div className="h-3.5 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-3.5 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      </Container>

      <Container className="mt-10 flex flex-col gap-2.5 lg:flex-row">
        <div className="gap-1.25 lg:mt-15 flex w-full flex-col lg:w-[191px]">
          <div className="mb-2.5 hidden flex-wrap gap-2 lg:flex">
            <div className="rounded-4xl h-7 w-20 animate-pulse bg-gray-200" />
            <div className="rounded-4xl h-7 w-16 animate-pulse bg-gray-200" />
            <div className="w-18 rounded-4xl h-7 animate-pulse bg-gray-200" />
            <div className="rounded-4xl h-7 w-20 animate-pulse bg-gray-200" />
            <div className="w-18 rounded-4xl h-7 animate-pulse bg-gray-200" />
            <div className="rounded-4xl h-7 w-20 animate-pulse bg-gray-200" />
          </div>

          <div className="mb-2.5 flex flex-wrap gap-2 lg:hidden">
            <div className="rounded-4xl h-7 w-20 animate-pulse bg-gray-200" />
            <div className="rounded-4xl h-7 w-16 animate-pulse bg-gray-200" />
            <div className="w-18 rounded-4xl h-7 animate-pulse bg-gray-200" />
            <div className="rounded-4xl h-7 w-14 animate-pulse bg-gray-200" />
          </div>

          <div className="hidden h-7 flex-row items-center justify-between rounded-xl bg-gray-200 px-4 lg:flex">
            <div className="h-3 w-16 animate-pulse rounded bg-white" />
            <div className="h-3 w-12 animate-pulse rounded bg-white" />
          </div>

          <div className="gap-1.25 scrollbar-hidden flex flex-row overflow-x-auto lg:hidden">
            <div className="rounded-4xl h-7 w-20 animate-pulse bg-gray-200" />
            <div className="rounded-4xl h-7 w-16 animate-pulse bg-gray-200" />
            <div className="rounded-4xl h-7 w-24 animate-pulse bg-gray-200" />
            <div className="w-18 rounded-4xl h-7 animate-pulse bg-gray-200" />
            <div className="w-22 rounded-4xl h-7 animate-pulse bg-gray-200" />
          </div>

          <div className="lg:gap-1.25 hidden lg:flex lg:flex-col">
            <div className="h-7 animate-pulse rounded-xl bg-gray-200" />

            <div className="h-7 animate-pulse rounded-xl bg-gray-200" />

            {Array.from({ length: 12 }).map((_, idx) => (
              <div
                className="h-7 animate-pulse rounded-xl bg-gray-200"
                key={idx}
              />
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-2 ml-2 flex items-center justify-between lg:mb-5 lg:ml-0">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-7 w-32 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="hidden lg:block">
            <ProductGridSkeleton count={20} />
          </div>
          <div className="lg:hidden">
            <MobileCategoryProductsSkeleton />
          </div>
        </div>
      </Container>
    </>
  );
}
