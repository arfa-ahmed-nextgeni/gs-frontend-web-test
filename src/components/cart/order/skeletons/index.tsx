import { OrderPerksSkeleton } from "@/components/cart/order/skeletons/order-perks-skeleton";
import Container from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

import { CartListSkeleton } from "./cart-list-skeleton";
import { OrderActionsSkeleton } from "./order-actions-skeleton";
import { OrderSummarySkeleton } from "./order-summary-skeleton";
import { CartProductRailSkeleton } from "./product-rail-skeleton";

export function CartPageSkeleton() {
  return (
    <Container
      className="lg:pt-4.5 lg:pb-30 pb-35 flex flex-col px-0 pt-5 lg:block"
      variant="Normal"
    >
      <div className="order-1 w-full max-w-none lg:order-none">
        <CartPageSkeletonContent />
      </div>

      <div className="order-3 w-full max-w-none">
        <CartProductRailSkeleton headerClassName="px-5 lg:px-0" />
      </div>

      <div className="order-4 mt-6 block w-full max-w-none lg:order-none lg:hidden">
        <OrderSummaryCardSkeleton />
      </div>

      <div className="order-5 w-full max-w-none lg:order-none">
        <StickyCheckoutSkeleton />
      </div>
    </Container>
  );
}

export function CartPageSkeletonContent({
  showHeader = true,
}: {
  showHeader?: boolean;
} = {}) {
  return (
    <div>
      {showHeader && (
        <div className="hidden lg:ml-7 lg:flex">
          <Skeleton className="w-34 h-5" />
        </div>
      )}
      <header className="mb-4 mt-4 pl-4 lg:mt-10 lg:px-0 rtl:pr-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-28" />
      </header>

      <section className="grid w-full max-w-none grid-cols-1 gap-2.5 lg:grid-cols-12">
        <div className="col-span-1 w-full max-w-none lg:col-span-8">
          <CartListSkeleton />
          <CartProductRailSkeleton className="mt-14" />
        </div>

        <aside className="mt-6 hidden w-full max-w-none lg:col-span-4 lg:mt-0 lg:block">
          <OrderSummaryCardSkeleton />
        </aside>
      </section>
    </div>
  );
}

function OrderSummaryCardSkeleton() {
  return (
    <>
      <OrderActionsSkeleton />
      <OrderSummarySkeleton />
      <OrderPerksSkeleton />
    </>
  );
}

function StickyCheckoutSkeleton() {
  return (
    <div className="border-border-base bg-bg-default pb-safe fixed inset-x-0 bottom-0 z-40 border-t">
      <div className="mx-auto flex max-w-6xl items-center justify-center px-5 pb-[calc(var(--bottom-nav-height,60px)+20px)] pt-5 lg:justify-end lg:px-0 lg:py-3 lg:pb-3">
        <Skeleton className="lg:w-97.5 h-12 w-full max-w-sm rounded-xl" />
      </div>
    </div>
  );
}
