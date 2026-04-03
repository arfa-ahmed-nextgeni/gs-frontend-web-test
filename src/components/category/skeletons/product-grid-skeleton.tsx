import { ProductCardSkeleton } from "@/components/product/product-card/fallbacks/product-card-skeleton";
import { ProductCardVariant } from "@/lib/constants/product/product-card";
import { cn } from "@/lib/utils";

/**
 * Skeleton loader for product grid
 * Shows grid of skeleton cards while loading
 */
export function ProductGridSkeleton({
  count = 20,
  desktopColumns = 5,
  variant = ProductCardVariant.Single,
}: {
  count?: number;
  desktopColumns?: 5 | 6;
  variant?: ProductCardVariant;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 justify-items-center gap-2.5 lg:grid-cols-5",
        {
          "xl:grid-cols-6 xl:gap-2": desktopColumns === 6,
        }
      )}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={`skeleton-${idx}`} variant={variant} />
      ))}
    </div>
  );
}
