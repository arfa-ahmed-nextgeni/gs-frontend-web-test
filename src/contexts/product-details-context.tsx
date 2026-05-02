"use client";

import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useMobileTopBarContext } from "@/contexts/mobile-top-bar-context";
import { useCart } from "@/contexts/use-cart";
import { useWishlist } from "@/contexts/use-wishlist";
import { useProductCountdownTimer } from "@/hooks/product/use-product-countdown-timer";
import {
  ProductDetailsModel,
  ProductVariant,
} from "@/lib/models/product-details-model";
import { CountdownTimer } from "@/lib/types/product/countdown-timer";
import { findMatchingWishlistItem } from "@/lib/utils/wishlist";

interface ProductDetailsContextValue {
  appLinks?:
    | {
        imageUrl: string;
        label: string;
        url: string;
      }[]
    | null;
  countdownData: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null;
  countdownTimer: CountdownTimer | null;
  isInCart: boolean;
  isWishlisted: boolean;
  product: ProductDetailsModel;
  selectedProduct: ProductVariant;
  selectedVariantIndex: number;
  setSelectedVariantIndex: Dispatch<SetStateAction<number>>;
}

export const ProductDetailsContext = createContext<
  ProductDetailsContextValue | undefined
>(undefined);

export function ProductDetailsProvider({
  appLinks,
  children,
  product,
}: PropsWithChildren<{
  appLinks?:
    | {
        imageUrl: string;
        label: string;
        url: string;
      }[]
    | null;
  product: ProductDetailsModel;
}>) {
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const { setProductInfo } = useMobileTopBarContext();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(
    product.defaultSelectedVariantIndex || 0
  );

  useEffect(() => {
    const selectedProduct = product.variants[selectedVariantIndex] || product;
    setProductInfo({
      brand: product.brand,
      externalId: product.externalId,
      id: product.id,
      name: product.name,
      priceValue: selectedProduct.priceValue || product.priceValue,
      sku: selectedProduct.sku || product.sku,
      type: product.type?.toString(),
    });
  }, [product, selectedVariantIndex, setProductInfo]);

  const selectedProduct = product.variants[selectedVariantIndex] || product;

  const isInCart = useMemo(
    () => !!cart?.items.find((item) => selectedProduct.sku === item.sku),
    [cart?.items, selectedProduct.sku]
  );

  const isWishlisted = useMemo(
    () =>
      !!findMatchingWishlistItem({
        product,
        selectedProduct,
        wishlist,
      }),
    [product, selectedProduct, wishlist]
  );

  const countdownTimer = useMemo(
    () =>
      product.variants[selectedVariantIndex]?.countdownTimer ||
      product.countdownTimer,
    [product.countdownTimer, product.variants, selectedVariantIndex]
  );

  const { countdownData } = useProductCountdownTimer({
    countdownTimer,
  });

  return (
    <ProductDetailsContext.Provider
      value={{
        appLinks,
        countdownData,
        countdownTimer,
        isInCart,
        isWishlisted,
        product,
        selectedProduct,
        selectedVariantIndex,
        setSelectedVariantIndex,
      }}
    >
      {children}
    </ProductDetailsContext.Provider>
  );
}

export function useProductDetails() {
  const context = useContext(ProductDetailsContext);
  if (!context) {
    throw new Error(
      "useProductDetails must be used within a ProductDetailsProvider"
    );
  }
  return context;
}
