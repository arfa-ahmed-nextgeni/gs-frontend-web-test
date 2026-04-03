import { ProductCardSkeleton } from "@/components/product/product-card/fallbacks/product-card-skeleton";
import { ProductCardVariant } from "@/lib/constants/product/product-card";

/**
 * Skeleton loader for mobile category products
 * Shows mobile-optimized skeleton cards while loading
 */
export function MobileCategoryProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 px-2.5">
      {Array.from({ length: 10 }).map((_, idx) => (
        <ProductCardSkeleton
          key={`mobile-skeleton-${idx}`}
          variant={ProductCardVariant.Single}
        />
      ))}
    </div>
  );
}
