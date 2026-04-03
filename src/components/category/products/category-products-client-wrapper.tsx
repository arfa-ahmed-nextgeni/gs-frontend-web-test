"use client";

import { useEffect } from "react";

import { ProductLoadError } from "@/components/category/errors/product-load-error";
import { MobileCategoryProducts } from "@/components/category/products/mobile-category-products";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { type Locale } from "@/lib/constants/i18n";
import { type ProductCardModel } from "@/lib/models/product-card-model";
import {
  trackCategoryView,
  trackProductImpressions,
} from "@/lib/utils/analytics";

interface CategoryProductsClientWrapperProps {
  categoryMetadata?: {
    name: string;
    uid: string;
    urlPath?: string;
  };
  categoryPath: string;
  categoryUid: string;
  currentPage: number;
  isBulletDeliveryEnabled: boolean;
  locale: Locale;
  products: ProductCardModel[];
  searchTerm?: string;
  totalCount: number;
  totalPages: number;
}

export function CategoryProductsClientWrapper({
  categoryMetadata,
  categoryPath,
  categoryUid,
  currentPage,
  isBulletDeliveryEnabled,
  locale,
  products,
  searchTerm,
  totalCount,
  totalPages,
}: CategoryProductsClientWrapperProps) {
  useEffect(() => {
    if (categoryMetadata && products.length > 0) {
      trackCategoryView({
        categoryId: categoryMetadata.uid,
        categoryName: categoryMetadata.name,
        productCount: totalCount,
      });

      trackProductImpressions({
        categoryId: categoryMetadata.uid,
        categoryName: categoryMetadata.name,
        products: products.map((product) => ({
          currency: product.currency || "SAR",
          discountPercent: product.discountPercent,
          id: product.id,
          name: product.name,
          price: product.priceValue || 0,
        })),
      });
    }
  }, [categoryMetadata, products, totalCount]);

  return (
    <div className="lg:hidden">
      <ErrorBoundary fallback={<ProductLoadError />}>
        <MobileCategoryProducts
          categoryMetadata={categoryMetadata}
          categoryPath={categoryPath}
          categoryUid={categoryUid}
          initialPage={currentPage}
          initialProducts={products}
          isBulletDeliveryEnabled={isBulletDeliveryEnabled}
          locale={locale}
          searchTerm={searchTerm}
          totalPages={totalPages}
        />
      </ErrorBoundary>
    </div>
  );
}
