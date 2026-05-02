"use client";

import { useProductCardActionsState } from "@/components/product/product-card/hooks/use-product-card-actions-state";
import { ProductCardButton } from "@/components/product/product-card/product-card-button";
import { ProductCardWishlistButton } from "@/components/product/product-card/product-card-wishlist-button";

import type { ProductCardInteractionProps } from "@/components/product/product-card/types/product-card-click-origin-types";

type ProductCardActionsContentProps = {
  isWishlistItem?: boolean;
} & ProductCardInteractionProps;

export const ProductCardActionsContent = ({
  categoryId,
  isWishlistItem,
  lpColumn,
  lpExtra,
  lpInnerPosition,
  lpRow,
  position,
  product,
  searchTerm,
}: ProductCardActionsContentProps) => {
  const { cartAction, isConfigurable, isInCart, isWishlisted } =
    useProductCardActionsState(product);

  return (
    <>
      <ProductCardButton
        cartAction={cartAction}
        categoryId={categoryId}
        lpColumn={lpColumn}
        lpExtra={lpExtra}
        lpInnerPosition={lpInnerPosition}
        lpRow={lpRow}
        position={position}
        product={product}
        searchTerm={searchTerm}
      />
      <ProductCardWishlistButton
        categoryId={categoryId}
        isConfigurable={isConfigurable}
        isInCart={isInCart}
        isWishlisted={isWishlisted}
        isWishlistItem={isWishlistItem}
        lpColumn={lpColumn}
        lpExtra={lpExtra}
        lpInnerPosition={lpInnerPosition}
        lpRow={lpRow}
        position={position}
        product={product}
        searchTerm={searchTerm}
      />
    </>
  );
};
