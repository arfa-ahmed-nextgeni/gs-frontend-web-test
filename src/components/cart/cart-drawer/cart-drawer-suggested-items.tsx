"use client";

import { useMemo } from "react";

import { useTranslations } from "next-intl";

import { CartDrawerSuggestedItemsSkeleton } from "@/components/cart/cart-drawer/cart-drawer-suggested-items-skeleton";
import { ProductCardMini } from "@/components/product/product-card-mini";
import { useCart } from "@/contexts/use-cart";
import { useCartDrawerSuggestedProductsQuery } from "@/hooks/queries/cart/use-cart-drawer-suggested-products-query";
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";
import { StockStatus } from "@/lib/constants/product/product-card";
import { cn } from "@/lib/utils";
import { getDisplayOnClassName } from "@/lib/utils/display-on";

import type { CartSuggestedProductsApiSection } from "@/lib/types/cart-suggested-products";

interface CartDrawerSuggestedItemsListProps {
  suggestedProducts: CartSuggestedProductsApiSection["products"];
  valueClassNames?: string;
}

interface CartDrawerSuggestedItemsProps {
  containerClassNames?: string;
  valueClassNames?: string;
}

const CartDrawerSuggestedItemsList = ({
  suggestedProducts,
  valueClassNames,
}: CartDrawerSuggestedItemsListProps) => {
  const scrollRef = useHorizontalScroll<HTMLDivElement>();

  return (
    <div
      className={cn(
        "flex flex-row gap-2.5 overflow-x-auto overscroll-x-contain px-5",
        valueClassNames
      )}
      ref={scrollRef}
    >
      {suggestedProducts.map((product, index) => (
        <ProductCardMini key={index} product={product} />
      ))}
    </div>
  );
};

export const CartDrawerSuggestedItems = ({
  containerClassNames,
  valueClassNames,
}: CartDrawerSuggestedItemsProps) => {
  const { cart, cartHasItems } = useCart();

  const t = useTranslations("CartPage.drawer.suggestedItemsSection");

  const { data, isPending } = useCartDrawerSuggestedProductsQuery({
    enabled: cartHasItems,
  });

  const suggestedProductSections = useMemo(() => {
    const cartSkus = cart?.items?.map((item) => item.sku) || [];

    return (data?.sections ?? []).flatMap((section) => {
      const products = section.products
        .filter((product) => product.stockStatus === StockStatus.InStock)
        .filter((product) => !cartSkus.includes(product.sku));

      return products.length > 0 ? [{ ...section, products }] : [];
    });
  }, [data?.sections, cart?.items]);

  if (!cartHasItems) return null;

  if (isPending) return <CartDrawerSuggestedItemsSkeleton />;

  if (suggestedProductSections.length === 0) return null;

  return (
    <>
      {suggestedProductSections.map((section) => (
        <div
          className={cn(
            "lg:mt-7.5 mb-5 mt-5 flex flex-col gap-5",
            containerClassNames,
            getDisplayOnClassName(section.displayOn, "flex")
          )}
          key={section.id}
        >
          <p className="text-text-primary lg:border-border-base mx-5 text-xl font-medium leading-none lg:border-t lg:pt-4">
            {section.title || t("title")}
          </p>
          <CartDrawerSuggestedItemsList
            suggestedProducts={section.products}
            valueClassNames={valueClassNames}
          />
        </div>
      ))}
    </>
  );
};
