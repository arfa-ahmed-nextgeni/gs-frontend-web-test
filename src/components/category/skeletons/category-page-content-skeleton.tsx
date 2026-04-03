import { MobileCategoryProductsSkeleton } from "@/components/category/skeletons/mobile-category-products-skeleton";
import { ProductGridSkeleton } from "@/components/category/skeletons/product-grid-skeleton";
import Container from "@/components/shared/container";

export function CategoryPageContentSkeleton() {
  return (
    <Container className="mt-5 flex flex-col gap-2.5 lg:flex-row">
      <div className="hidden w-[191px] lg:block" />

      <div className="min-w-0 flex-1">
        <div className="mb-2 ml-2 flex min-w-0 items-center justify-between gap-2 lg:mb-5 lg:ml-0">
          <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-7 w-24 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="hidden lg:block">
          <ProductGridSkeleton count={20} />
        </div>

        <div className="lg:hidden">
          <MobileCategoryProductsSkeleton />
        </div>
      </div>
    </Container>
  );
}
