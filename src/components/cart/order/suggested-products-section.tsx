import { Suspense } from "react";

import { CartListSkeleton } from "@/components/cart/order/skeletons/cart-list-skeleton";

import { SuggestedProducts } from "./suggested-products";

interface SuggestedProductsSectionProps {
  locale: string;
}

export const SuggestedProductsSection = ({
  locale,
}: SuggestedProductsSectionProps) => {
  return (
    <Suspense fallback={<CartListSkeleton />}>
      <SuggestedProducts locale={locale} />
    </Suspense>
  );
};
