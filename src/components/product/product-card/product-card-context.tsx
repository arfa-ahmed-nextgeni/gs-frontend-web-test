"use client";

import React, { ComponentProps, useMemo } from "react";

import { useCart } from "@/contexts/use-cart";
import { useWishlist } from "@/contexts/use-wishlist";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouteMatch } from "@/hooks/use-route-match";
import {
  CartAction,
  ProductCardVariant,
  StockStatus,
} from "@/lib/constants/product/product-card";
import { ProductCardModel } from "@/lib/models/product-card-model";
import { cn } from "@/lib/utils";

interface ProductCardContextValue {
  cartAction: CartAction;
  categoryId?: number;
  isConfigurable: boolean;
  isInCart: boolean;
  isWishlisted: boolean;
  lpColumn?: number;
  lpExtra?: Record<string, unknown>;
  lpInnerPosition?: number;
  lpRow?: number;
  originalProduct: ProductInput;
  position?: number;
  product: ProductCardModel;
  searchTerm?: string;
}

export const ProductCardContext = React.createContext<
  ProductCardContextValue | undefined
>(undefined);

type ProductInput = Partial<ProductCardModel> | ProductCardModel;

/**
 * ProductCardProvider
 * - Works with both full ProductCardModel and lightweight objects (e.g., from Cart)
 */
export function ProductCardProvider({
  categoryId,
  children,
  containerProps,
  formatChildren = false,
  lpColumn,
  lpExtra,
  lpInnerPosition,
  lpRow,
  position,
  product,
  searchTerm,
}: React.PropsWithChildren<{
  categoryId?: number;
  containerProps?: ComponentProps<"div">;
  formatChildren?: boolean;
  lpColumn?: number;
  lpExtra?: Record<string, unknown>;
  lpInnerPosition?: number;
  lpRow?: number;
  position?: number;
  product: ProductInput;
  searchTerm?: string;
}>) {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { isCart, isWishlist } = useRouteMatch();

  const isMobile = useIsMobile();

  // ✅ Normalize the product — ensures all required fields exist
  const normalizedProduct = useMemo(() => {
    if (product instanceof ProductCardModel) return product;

    // Construct a minimal valid model if a plain object was passed
    return new ProductCardModel({
      currency: product.currency ?? "USD",
      description: product.description ?? "",
      discountPercent: product.discountPercent ?? undefined,
      externalId: product.externalId ?? "",
      id: product.id ?? "",
      imageUrl: product.imageUrl ?? "",
      name: product.name ?? "",
      oldPrice:
        typeof product.oldPrice === "number"
          ? product.oldPrice
          : parseFloat(String(product.oldPrice ?? "0")),
      options: product.options as any,
      price:
        typeof product.currentPrice === "number"
          ? product.currentPrice
          : parseFloat(String(product.currentPrice ?? "0")),
      sku: product.sku ?? "",
      stockStatus: product.stockStatus ?? StockStatus.InStock,
      urlKey: product.urlKey ?? "",
      variant: product.variant,
    });
  }, [product]);

  const isInCart = useMemo(
    () => !!cart?.items.find((item) => normalizedProduct.sku === item.sku),
    [cart?.items, normalizedProduct.sku]
  );

  const isWishlisted = useMemo(
    () => !!wishlist?.items.find((item) => normalizedProduct.sku === item.sku),
    [normalizedProduct.sku, wishlist?.items]
  );

  const isConfigurable = useMemo(
    () =>
      !!normalizedProduct.options?.choices &&
      normalizedProduct.options.choices.length > 0,
    [normalizedProduct.options]
  );

  const cartAction = useMemo(() => {
    if (isWishlisted && (isWishlist || isCart)) {
      if (normalizedProduct.stockStatus === StockStatus.OutOfStock) {
        return CartAction.NotifyMe;
      }
      return CartAction.MoveToBag;
    } else if (isInCart) {
      return CartAction.Remove;
    } else if (
      normalizedProduct.stockStatus === StockStatus.OutOfStock &&
      !isConfigurable
    ) {
      return CartAction.NotifyMe;
    } else if (isConfigurable) {
      return CartAction.Options;
    }

    return CartAction.Add;
  }, [
    isCart,
    isConfigurable,
    isInCart,
    isWishlist,
    isWishlisted,
    normalizedProduct?.stockStatus,
  ]);

  return (
    <ProductCardContext.Provider
      value={{
        cartAction,
        categoryId,
        isConfigurable,
        isInCart,
        isWishlisted,
        lpColumn,
        lpExtra,
        lpInnerPosition,
        lpRow,
        originalProduct: product,
        position,
        product: normalizedProduct,
        searchTerm,
      }}
    >
      {formatChildren ? (
        <article>{children}</article>
      ) : (
        <div
          {...containerProps}
          className={cn(
            "h-77.5 transition-default bg-bg-default group relative overflow-hidden rounded-xl",
            "w-[calc(50vw-15px)] sm:w-[172px]",
            "lg:w-48",
            product.variant === ProductCardVariant.Bundles && "lg:w-60",
            containerProps?.className
          )}
          tabIndex={isMobile ? 0 : undefined}
        >
          {children}
        </div>
      )}
    </ProductCardContext.Provider>
  );
}

export function useProductCard() {
  const context = React.useContext(ProductCardContext);
  if (!context) {
    throw new Error("useProductCard must be used within a ProductCardProvider");
  }
  return context;
}
