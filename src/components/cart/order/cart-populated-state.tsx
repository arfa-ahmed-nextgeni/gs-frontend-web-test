import React from "react";

import { GiftItemsSection } from "@/components/cart/order/gift-items-section";
import { CartItem } from "@/lib/models/cart";

import { CartList } from "./cart-list";
import { OrderSummaryCard } from "./order-summary/order-summary-card";

export const CartPopulatedState = ({
  items,
  suggestedProducts,
}: {
  items: CartItem[];
  suggestedProducts: React.ReactNode;
}) => {
  const giftItems = items.filter((item) => item.isGwp);
  const cartItems = items.filter((item) => !item.isGwp);
  const giftsQuantity = giftItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <section className="grid w-full max-w-none grid-cols-1 gap-2.5 lg:grid-cols-12">
      {/* Left: Cart Items + Gift Section */}
      <div className="col-span-1 w-full max-w-none lg:col-span-8">
        <CartList items={cartItems} />
        {giftItems.length > 0 && (
          <GiftItemsSection
            giftItems={giftItems}
            totalQuantity={giftsQuantity}
          />
        )}
        <div className="mt-14 lg:block">{suggestedProducts}</div>
      </div>

      {/* Right: Order Summary (desktop only) */}
      <aside className="mt-6 hidden w-full max-w-none lg:col-span-4 lg:mt-0 lg:block">
        <OrderSummaryCard />
      </aside>
    </section>
  );
};
