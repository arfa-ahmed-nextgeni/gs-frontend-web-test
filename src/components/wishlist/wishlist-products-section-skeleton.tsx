import { ProductCardSkeleton } from "@/components/product/product-card/fallbacks/product-card-skeleton";
import { ProductCardVariant } from "@/lib/constants/product/product-card";

export const WishlistProductsSectionSkeleton = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="lg:mt-12.5 mt-2.5 grid grid-cols-2 justify-items-center gap-2.5 px-2.5 md:grid-cols-3 lg:px-0 xl:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <ProductCardSkeleton
            key={index}
            variant={ProductCardVariant.Single}
          />
        ))}
      </div>
    </div>
  );
};
