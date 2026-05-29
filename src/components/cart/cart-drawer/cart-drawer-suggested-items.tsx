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

interface CartDrawerSuggestedItemsListProps {
  suggestedProducts: NonNullable<
    ReturnType<typeof useCartDrawerSuggestedProductsQuery>["data"]
  >["products"];
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
        "flex flex-row gap-2.5 overflow-x-auto px-5",
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

  const title = data?.title || t("title");

  const suggestedProducts = useMemo(() => {
    const products = data?.products || [];
    const cartSkus = cart?.items?.map((item) => item.sku) || [];

    return products
      .filter((product) => product.stockStatus === StockStatus.InStock)
      .filter((product) => !cartSkus.includes(product.sku));
  }, [data?.products, cart]);

  if (!cartHasItems) return null;

  if (isPending) return <CartDrawerSuggestedItemsSkeleton />;

  if (!suggestedProducts.length) return null;

  return (
    <div
      className={cn(
        "lg:mt-7.5 mb-5 mt-5 flex flex-col gap-5",
        containerClassNames
      )}
    >
      <p className="text-text-primary lg:border-border-base mx-5 text-xl font-medium leading-none lg:border-t lg:pt-4">
        {title}
      </p>
      <CartDrawerSuggestedItemsList
        suggestedProducts={suggestedProducts}
        valueClassNames={valueClassNames}
      />
    </div>
  );
};
