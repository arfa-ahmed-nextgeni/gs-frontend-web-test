import { NoProductsFound } from "@/components/category/empty-states/no-products-found";
import { ProductCard } from "@/components/product/product-card";
import { ProductCardVariant } from "@/lib/constants/product/product-card";
import { ProductCardModel } from "@/lib/models/product-card-model";
import { cn } from "@/lib/utils";

export const CategoryProductGrid = ({
  categoryId,
  desktopColumns = 5,
  isBulletDeliveryEnabled,
  lpRow,
  optimizeProductImages = false,
  products,
  searchTerm,
}: {
  categoryId?: number;
  desktopColumns?: 5 | 6;
  isBulletDeliveryEnabled: boolean;
  lpRow?: number;
  optimizeProductImages?: boolean;
  products: ProductCardModel[];
  searchTerm?: string;
}) => {
  if (products.length === 0) {
    return <NoProductsFound />;
  }

  const hasBundles = products.some(
    (p) => p.variant === ProductCardVariant.Bundles,
  );
  const effectiveDesktopColumns = hasBundles ? 4 : desktopColumns;
  const displayProducts = hasBundles
    ? products.map((p) =>
        p.variant === ProductCardVariant.Bundles
          ? p
          : Object.assign(structuredClone(p), {
              variant: ProductCardVariant.Bundles,
            }),
      )
    : products;

  // Calculate row and column based on grid layout
  // Mobile: 2 columns, Desktop: configurable
  // For LP origin tracking:
  // - row: absolute row on landing page = lpRow + gridRow - 1
  // - column: column within the grid (1-2 for mobile, 1-4/5/6 for desktop)
  const getGridPosition = (index: number) => {
    const gridRow = Math.floor(index / effectiveDesktopColumns) + 1;
    const gridColumn = (index % effectiveDesktopColumns) + 1;
    return { gridColumn, gridRow };
  };

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2.5 md:grid-cols-3",
        hasBundles ? "lg:grid-cols-4" : "lg:grid-cols-5",
        !hasBundles && desktopColumns === 6 && "xl:grid-cols-6 xl:gap-2",
      )}
    >
      {displayProducts.map((product, index) => {
        const { gridColumn, gridRow } = getGridPosition(index);
        return (
          <ProductCard
            categoryId={categoryId}
            isBulletDeliveryEnabled={isBulletDeliveryEnabled}
            key={`${product.id}-${index}`}
            lpColumn={lpRow ? gridColumn : undefined}
            lpRow={lpRow ? lpRow + gridRow - 1 : undefined}
            optimizeImage={optimizeProductImages}
            position={index + 1}
            product={product}
            searchTerm={searchTerm}
          />
        );
      })}
    </div>
  );
};
