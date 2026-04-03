"use client";

import { useTranslations } from "next-intl";

import { CartDrawerItem } from "@/components/cart/cart-drawer/cart-drawer-item";
import { useCart } from "@/contexts/use-cart";
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";

export const CartDrawerItemsList = () => {
  const t = useTranslations("CartPage.drawer.alreadyInBagSection");

  const { cart } = useCart();

  const scrollRef = useHorizontalScroll<HTMLDivElement>();

  const cartItems = (cart?.items.slice(1) || []).filter((item) => !item.isWrap);

  if (!cartItems.length) return null;

  return (
    <div className="lg:mt-7.5 mt-5 flex flex-col gap-5 lg:mb-5">
      <p className="text-text-primary px-5 text-xl font-medium leading-none">
        {t("title")}
      </p>
      <div
        className="flex flex-row gap-2.5 overflow-x-auto px-5"
        ref={scrollRef}
      >
        {cartItems.map(
          ({
            countdownTimer,
            currentPrice,
            description,
            imageUrl,
            name,
            oldPrice,
            options,
            quantity,
            sku,
            uidInCart,
          }) => (
            <CartDrawerItem
              countdownTimer={countdownTimer}
              description={description}
              image={imageUrl}
              key={uidInCart}
              name={name}
              oldPrice={oldPrice}
              options={options}
              price={currentPrice}
              quantity={quantity}
              sku={sku}
              uid={uidInCart}
              variant="cart"
            />
          )
        )}
      </div>
    </div>
  );
};
