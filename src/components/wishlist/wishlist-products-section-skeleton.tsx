import { ProductCardSkeleton } from "@/components/product/product-card/fallbacks/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardVariant } from "@/lib/constants/product/product-card";

export const WishlistProductsSectionSkeleton = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="lg:mt-12.5 mt-2.5 grid grid-cols-2 justify-items-center gap-2.5 px-2.5 md:grid-cols-3 lg:px-0 xl:grid-cols-4">
        {[...Array(6)].map((_, index) => (
          <ProductCardSkeleton
            key={`single-${index}`}
            variant={ProductCardVariant.Single}
          />
        ))}
      </div>
      <section className="mt-5 flex flex-col gap-5 px-2.5 lg:px-0">
        <div className="border-border-base border-t" />
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-2 justify-items-center gap-2.5 lg:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
          {[...Array(2)].map((_, index) => (
            <ProductCardSkeleton
              key={`bundle-${index}`}
              variant={ProductCardVariant.Bundles}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
