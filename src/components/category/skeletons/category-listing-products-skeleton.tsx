import { MobileCategoryProductsSkeleton } from "@/components/category/skeletons/mobile-category-products-skeleton";
import { ProductGridSkeleton } from "@/components/category/skeletons/product-grid-skeleton";

export function CategoryListingProductsSkeleton() {
  return (
    <>
      <div className="hidden lg:block">
        <ProductGridSkeleton count={20} />
      </div>
      <div className="lg:hidden">
        <MobileCategoryProductsSkeleton />
      </div>
    </>
  );
}
