import { NoProductsFound } from "@/components/category/empty-states/no-products-found";
import { ProductCard } from "@/components/product/product-card";
import { ProductCardModel } from "@/lib/models/product-card-model";
import { cn } from "@/lib/utils";

export const CategoryProductGrid = ({
  categoryId,
  desktopColumns = 5,
  lpRow,
  products,
  searchTerm,
}: {
  categoryId?: number;
  desktopColumns?: 5 | 6;
  lpRow?: number;
  products: ProductCardModel[];
  searchTerm?: string;
}) => {
  if (products.length === 0) {
    return <NoProductsFound />;
  }

  // Calculate row and column based on grid layout
  // Mobile: 2 columns, Desktop: configurable
  // For LP origin tracking:
  // - row: absolute row on landing page = lpRow + gridRow - 1
  // - column: column within the grid (1-2 for mobile, 1-5/6 for desktop)
  const getGridPosition = (index: number) => {
    const gridRow = Math.floor(index / desktopColumns) + 1;
    const gridColumn = (index % desktopColumns) + 1;
    return { gridColumn, gridRow };
  };

  return (
    <div
      className={cn("grid grid-cols-2 gap-2.5 lg:grid-cols-5", {
        "xl:grid-cols-6 xl:gap-2": desktopColumns === 6,
      })}
    >
      {products.map((product, index) => {
        const { gridColumn, gridRow } = getGridPosition(index);
        return (
          <ProductCard
            categoryId={categoryId}
            key={product.id || product.sku || `product-${index}`}
            lpColumn={lpRow ? gridColumn : undefined}
            lpRow={lpRow ? lpRow + gridRow - 1 : undefined}
            position={index + 1}
            product={product}
            searchTerm={searchTerm}
          />
        );
      })}
    </div>
  );
};
