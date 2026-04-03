import { useMemo } from "react";

import { useCart } from "@/contexts/use-cart";
import { useWishlist } from "@/contexts/use-wishlist";
import { useRouteMatch } from "@/hooks/use-route-match";
import { CartAction, StockStatus } from "@/lib/constants/product/product-card";
import { ProductCardModel } from "@/lib/models/product-card-model";

export interface ProductCardActionsState {
  cartAction: CartAction;
  isConfigurable: boolean;
  isInCart: boolean;
  isWishlisted: boolean;
}

export const useProductCardActionsState = (
  product: ProductCardModel
): ProductCardActionsState => {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { isCart, isWishlist } = useRouteMatch();

  const isInCart = useMemo(
    () => !!cart?.items.find((item) => product.sku === item.sku),
    [cart?.items, product.sku]
  );

  const isWishlisted = useMemo(
    () => !!wishlist?.items.find((item) => item.sku === product.sku),
    [product.sku, wishlist?.items]
  );

  const isConfigurable = useMemo(
    () => !!product.options?.choices && product.options.choices.length > 0,
    [product.options]
  );

  const cartAction = useMemo(() => {
    if (isWishlisted && (isWishlist || isCart)) {
      if (product.stockStatus === StockStatus.OutOfStock) {
        return CartAction.NotifyMe;
      }

      return CartAction.MoveToBag;
    }

    if (isInCart) {
      return CartAction.Remove;
    }

    if (product.stockStatus === StockStatus.OutOfStock && !isConfigurable) {
      return CartAction.NotifyMe;
    }

    if (isConfigurable) {
      return CartAction.Options;
    }

    return CartAction.Add;
  }, [
    isCart,
    isConfigurable,
    isInCart,
    isWishlist,
    isWishlisted,
    product.stockStatus,
  ]);

  return {
    cartAction,
    isConfigurable,
    isInCart,
    isWishlisted,
  };
};
