import { CategoryProductGrid } from "@/components/category/products/category-product-grid";
import { CategoryProductsDesktopShell } from "@/components/category/products/category-products-desktop-shell";

import type { ProductCardModel } from "@/lib/models/product-card-model";

interface CategoryProductsDesktopProps {
  categoryId?: number;
  isBulletDeliveryEnabled: boolean;
  products: ProductCardModel[];
  searchTerm?: string;
  totalPages: number;
}

export function CategoryProductsDesktop({
  categoryId,
  isBulletDeliveryEnabled,
  products,
  searchTerm,
  totalPages,
}: CategoryProductsDesktopProps) {
  return (
    <CategoryProductsDesktopShell totalPages={totalPages}>
      <CategoryProductGrid
        categoryId={categoryId}
        isBulletDeliveryEnabled={isBulletDeliveryEnabled}
        products={products}
        searchTerm={searchTerm}
      />
    </CategoryProductsDesktopShell>
  );
}
