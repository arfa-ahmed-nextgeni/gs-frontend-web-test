"use client";

import { useEffect } from "react";

import { ProductCard } from "@/components/product/product-card";
import { PaginationWithSearchParams } from "@/components/shared/pagination-with-search-params";
import { WishlistEmptyState } from "@/components/wishlist/wishlist-empty-state";
import { WishlistProductsSectionSkeleton } from "@/components/wishlist/wishlist-products-section-skeleton";
import { useWishlistPaginatedQuery } from "@/hooks/queries/wishlist/use-wishlist-paginated-query";
import { useBulletDeliveryEnabled } from "@/hooks/use-bullet-delivery-enabled";
import { usePageQuery } from "@/hooks/use-page-query";

export const WishlistProductsSection = () => {
  const { currentPage, setCurrentPage } = usePageQuery();
  const isBulletDeliveryEnabled = useBulletDeliveryEnabled();

  const { data, isFetching, isLoading } = useWishlistPaginatedQuery({
    page: currentPage,
    pageSize: 8,
  });

  const wishlistProducts = data?.items || [];
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

  return (
    <div className="flex flex-col gap-5">
      <div className="lg:mt-12.5 mt-2.5 grid grid-cols-2 justify-items-center gap-2.5 px-2.5 md:grid-cols-3 lg:px-0 xl:grid-cols-4">
        {wishlistProducts.map((wishlistProduct, index) => (
          <ProductCard
            containerProps={{
              className: "max-[400px]:w-auto",
            }}
            isBulletDeliveryEnabled={isBulletDeliveryEnabled}
            key={`${wishlistProduct.id}-${index}`}
            product={wishlistProduct}
          />
        ))}
      </div>
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
