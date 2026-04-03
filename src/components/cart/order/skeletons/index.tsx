import { OrderPerksSkeleton } from "@/components/cart/order/skeletons/order-perks-skeleton";

import { CartListSkeleton } from "./cart-list-skeleton";
import { OrderActionsSkeleton } from "./order-actions-skeleton";
import { OrderSummarySkeleton } from "./order-summary-skeleton";

export function CartPageSkeletonContent() {
  return (
    <div className="lg:container">
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:py-12">
        {/* Cart List */}
        <div className="lg:col-span-8">
          <CartListSkeleton />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4">
          <div className="bg-white lg:rounded-2xl">
            <OrderActionsSkeleton />
            <OrderSummarySkeleton />
            <OrderPerksSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
