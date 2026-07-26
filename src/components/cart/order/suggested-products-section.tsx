import { Suspense } from "react";

import { CartProductRailSkeleton } from "@/components/cart/order/skeletons/product-rail-skeleton";

import { SuggestedProducts } from "./suggested-products";

interface SuggestedProductsSectionProps {
  locale: string;
}

export const SuggestedProductsSection = ({
  locale,
}: SuggestedProductsSectionProps) => {
  return (
    <Suspense fallback={<CartProductRailSkeleton />}>
      <SuggestedProducts locale={locale} />
    </Suspense>
  );
};
