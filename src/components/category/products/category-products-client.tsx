"use client";

import { Suspense } from "react";

import { ProductLoadError } from "@/components/category/errors/product-load-error";
import { CategoryProductGrid } from "@/components/category/products/category-product-grid";
import { ProductGridSkeleton } from "@/components/category/skeletons/product-grid-skeleton";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { PaginationWithSearchParams } from "@/components/shared/pagination-with-search-params";
import { useBulletDeliveryEnabled } from "@/hooks/use-bullet-delivery-enabled";
import { usePageQuery } from "@/hooks/use-page-query";

import type { ProductCardModel } from "@/lib/models/product-card-model";

interface CategoryProductsClientV2Props {
  categoryId?: number;
  products: ProductCardModel[];
  searchTerm?: string;
  totalPages: number;
}

export function CategoryProductsClientV2({
  categoryId,
  products,
  searchTerm,
  totalPages,
}: CategoryProductsClientV2Props) {
  const { isLoading } = usePageQuery();
  const isBulletDeliveryEnabled = useBulletDeliveryEnabled();

  return (
    <div className="flex flex-col gap-8">
      <ErrorBoundary fallback={<ProductLoadError />}>
        <Suspense fallback={<ProductGridSkeleton count={20} />}>
          {isLoading ? (
            <ProductGridSkeleton count={20} />
          ) : (
            <CategoryProductGrid
              categoryId={categoryId}
              isBulletDeliveryEnabled={isBulletDeliveryEnabled}
              products={products}
              searchTerm={searchTerm}
            />
          )}
        </Suspense>
      </ErrorBoundary>

      <div className="mt-8">
        <PaginationWithSearchParams
          containerProps={{
            className: "flex",
          }}
          queryOptions={{
            scroll: true,
          }}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
