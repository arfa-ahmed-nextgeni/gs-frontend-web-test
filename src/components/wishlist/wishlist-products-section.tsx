"use client";

import { useEffect } from "react";

import { useTranslations } from "next-intl";

import { WishlistTracker } from "@/components/analytics/wishlist-tracker";
import { ProductCard } from "@/components/product/product-card";
import { PaginationWithSearchParams } from "@/components/shared/pagination-with-search-params";
import { WishlistEmptyState } from "@/components/wishlist/wishlist-empty-state";
import { WishlistProductsSectionSkeleton } from "@/components/wishlist/wishlist-products-section-skeleton";
import { useWishlistPaginatedQuery } from "@/hooks/queries/wishlist/use-wishlist-paginated-query";
import { useBulletDeliveryEnabled } from "@/hooks/use-bullet-delivery-enabled";
import { usePageQuery } from "@/hooks/use-page-query";
import { ProductCardVariant } from "@/lib/constants/product/product-card";
import { cn } from "@/lib/utils";

export const WishlistProductsSection = () => {
  const t = useTranslations("CustomerWishlistPage");
  const { currentPage, setCurrentPage } = usePageQuery();
  const isBulletDeliveryEnabled = useBulletDeliveryEnabled();

  const { data, isFetching, isLoading } = useWishlistPaginatedQuery({
    page: currentPage,
    pageSize: 8,
  });

  const wishlistProducts = (data?.items || [])
    .slice()
    .sort((a, b) => Number(a.isOutOfStock) - Number(b.isOutOfStock));

  const totalPages = data?.totalPages || 1;

  useEffect(() => {
    if (
      !isLoading &&
      !isFetching &&
      currentPage > 1 &&
      wishlistProducts.length === 0 &&
      totalPages > 0
    ) {
      const safePage = Math.min(currentPage, totalPages);

      setCurrentPage(safePage);
    }
  }, [
    currentPage,
    data,
    isFetching,
    isLoading,
    setCurrentPage,
    totalPages,
    wishlistProducts.length,
  ]);

  if (isLoading) {
    return <WishlistProductsSectionSkeleton />;
  }

  if (!wishlistProducts.length) {
    return <WishlistEmptyState />;
  }

  const singleProducts = wishlistProducts.filter(
    (product) => product.variant !== ProductCardVariant.Bundles
  );
  const bundleProducts = wishlistProducts.filter(
    (product) => product.variant === ProductCardVariant.Bundles
  );
  const hasSingleProducts = singleProducts.length > 0;
  const hasBundleProducts = bundleProducts.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <WishlistTracker wishlistProducts={wishlistProducts} />

      {hasSingleProducts && (
        <div className="lg:mt-12.5 mt-2.5 grid grid-cols-2 gap-2.5 px-2.5 md:grid-cols-3 lg:px-0 xl:grid-cols-4">
          {singleProducts.map((wishlistProduct, index) => (
            <ProductCard
              isBulletDeliveryEnabled={isBulletDeliveryEnabled}
              isWishlistItem
              key={`${wishlistProduct.id}-${index}`}
              product={wishlistProduct}
            />
          ))}
        </div>
      )}

      {hasBundleProducts && (
        <section
          className={cn(
            "flex flex-col gap-5 px-2.5 lg:px-0",
            hasSingleProducts ? "mt-5" : "lg:mt-12.5 mt-2.5"
          )}
        >
          {hasSingleProducts && <div className="border-border-base border-t" />}
          <h2 className="text-text-primary text-2xl font-semibold">
            {t("bundlesWishlist")}
          </h2>
          <div className="grid grid-cols-2 justify-items-center gap-2.5 lg:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
            {bundleProducts.map((wishlistProduct, index) => (
              <ProductCard
                isBulletDeliveryEnabled={isBulletDeliveryEnabled}
                isWishlistItem
                key={`${wishlistProduct.id}-${index}`}
                product={wishlistProduct}
              />
            ))}
          </div>
        </section>
      )}

      {totalPages > 1 && (
        <PaginationWithSearchParams
          queryOptions={{
            scroll: true,
          }}
          totalPages={totalPages}
        />
      )}
    </div>
  );
};
