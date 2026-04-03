import { ProductCardButtonSkeleton } from "@/components/product/product-card/fallbacks/product-card-button-skeleton";
import { ProductCardWishlistButtonSkeleton } from "@/components/product/product-card/fallbacks/product-card-wishlist-button-skeleton";

export const ProductCardActionsFallback = ({
  isConfigurable = false,
}: {
  isConfigurable?: boolean;
}) => (
  <>
    <ProductCardButtonSkeleton />
    {isConfigurable ? null : <ProductCardWishlistButtonSkeleton />}
  </>
);
