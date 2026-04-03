"use client";

import { useTranslations } from "next-intl";

import { CartDrawerSuggestedItemsSkeleton } from "@/components/cart/cart-drawer/cart-drawer-suggested-items-skeleton";
import { ProductCardMini } from "@/components/product/product-card-mini";
import { useCart } from "@/contexts/use-cart";
import { useCartDrawerSuggestedProductsQuery } from "@/hooks/queries/cart/use-cart-drawer-suggested-products-query";
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";
import { cn } from "@/lib/utils";

interface CartDrawerSuggestedItemsProps {
  containerClassNames?: string;
  valueClassNames?: string;
}

export const CartDrawerSuggestedItems = ({
  containerClassNames,
  valueClassNames,
}: CartDrawerSuggestedItemsProps) => {
  const { cartHasItems } = useCart();

  const t = useTranslations("CartPage.drawer.suggestedItemsSection");

  const scrollRef = useHorizontalScroll<HTMLDivElement>();

  const { data: suggestedProducts = [], isPending } =
    useCartDrawerSuggestedProductsQuery({
      enabled: cartHasItems,
    });

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
        {t("title")}
      </p>
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
    </div>
  );
};
