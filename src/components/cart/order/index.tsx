"use client";

import { CartContent } from "@/components/cart/order/cart-content";
import { OrderSummaryCard } from "@/components/cart/order/order-summary/order-summary-card";
import { StickyCheckoutBar } from "@/components/cart/order/sticky-checkout";
import { WishListSection } from "@/components/cart/order/wishlist-section";
import Container from "@/components/shared/container";
import { useCart } from "@/contexts/use-cart";

export const Cart = ({
  suggestedProducts,
}: {
  suggestedProducts: React.ReactNode;
}) => {
  const { cart } = useCart();

  return (
    <Container
      className="lg:pt-4.5 lg:pb-30 pb-35 flex flex-col px-0 pt-5 lg:block"
      variant="Normal"
    >
      <div className="order-1 w-full max-w-none lg:order-none">
        <CartContent suggestedProducts={suggestedProducts} />
      </div>

      {cart?.items.length === 0 && (
        <div className="order-2 w-full max-w-none lg:block">
          {suggestedProducts}
        </div>
      )}

      <div className="order-3 w-full max-w-none">
        <WishListSection />
      </div>

      <div className="order-4 mt-6 block w-full max-w-none lg:order-none lg:hidden">
        <OrderSummaryCard />
      </div>

      <div className="order-5 w-full max-w-none lg:order-none">
        <StickyCheckoutBar />
      </div>
    </Container>
  );
};
