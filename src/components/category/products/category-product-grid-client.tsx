"use client";

import React from "react";

import { NoProductsFound } from "@/components/category/empty-states/no-products-found";
import { ProductCard } from "@/components/product/product-card";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { ProductCardModel } from "@/lib/models/product-card-model";

export const CategoryProductGridClient = ({
  categoryId,
  lpRow,
  products,
  searchTerm,
}: {
  categoryId?: number;
  lpRow?: number;
  products: ProductCardModel[];
  searchTerm?: string;
}) => {
  const isMobile = useIsMobile();

  if (products.length === 0) {
    return <NoProductsFound />;
  }

  // Calculate row and column based on grid layout
  // Mobile: 2 columns, Desktop: 5 columns
  // For LP origin tracking:
  // - row: absolute row on landing page = lpRow + gridRow - 1
  // - column: column within the grid (1-2 for mobile, 1-5 for desktop)
  const getGridPosition = (index: number) => {
    const columns = isMobile ? 2 : 5;
    const gridRow = Math.floor(index / columns) + 1;
    const gridColumn = (index % columns) + 1;
    return { gridColumn, gridRow };
  };

  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-5">
      {products.map((product, idx) => {
        const { gridColumn, gridRow } = getGridPosition(idx);
        return (
          <ProductCard
            categoryId={categoryId}
            key={`${product.id}-${idx}`}
            lpColumn={lpRow ? gridColumn : undefined}
            lpRow={lpRow ? lpRow + gridRow - 1 : undefined}
            position={idx + 1}
            product={product}
            searchTerm={searchTerm}
          />
        );
      })}
    </div>
  );
};
