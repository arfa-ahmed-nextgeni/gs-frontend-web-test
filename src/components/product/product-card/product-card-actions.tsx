"use client";

import { lazy, useEffect, useEffectEvent, useState } from "react";

import { AsyncBoundary } from "@/components/common/async-boundary";
import { ProductCardActionsFallback } from "@/components/product/product-card/fallbacks/product-card-actions-fallback";
import { useProductCardVisibilityLoad } from "@/components/product/product-card/hooks/use-product-card-visibility-load";
import { cn } from "@/lib/utils";

import type { ProductCardInteractionProps } from "@/components/product/product-card/types/product-card-click-origin-types";

const ProductCardActionsContent = lazy(() =>
  import("@/components/product/product-card/product-card-actions-content").then(
    (module) => ({
      default: module.ProductCardActionsContent,
    })
  )
);

export const ProductCardActions = (props: ProductCardInteractionProps) => {
  const { sentinelRef, shouldLoad: isVisible } =
    useProductCardVisibilityLoad<HTMLDivElement>({
      rootMargin: "120px 0px",
    });
  const [shouldLoad, setShouldLoad] = useState(false);
  const isConfigurable = !!props.product.options?.choices?.length;

  const loadActions = useEffectEvent(() => {
    setShouldLoad(true);
  });

  useEffect(() => {
    if (shouldLoad || !isVisible || !sentinelRef.current?.parentElement) {
      return;
    }

    const productCard = sentinelRef.current.parentElement;

    productCard.addEventListener("focusin", loadActions, { once: true });
    productCard.addEventListener("pointerenter", loadActions, { once: true });
    productCard.addEventListener("touchstart", loadActions, {
      once: true,
      passive: true,
    });

    return () => {
      productCard.removeEventListener("focusin", loadActions);
      productCard.removeEventListener("pointerenter", loadActions);
      productCard.removeEventListener("touchstart", loadActions);
    };
  }, [isVisible, sentinelRef, shouldLoad]);

  return (
    <div
      className={cn(
        "transition-default absolute bottom-0 flex w-full translate-y-9 flex-row items-center justify-between px-5",
        "group-focus-within:-translate-y-3 group-hover:-translate-y-3 group-has-[button[data-loading=true]]:-translate-y-3"
      )}
      ref={sentinelRef}
    >
      {shouldLoad ? (
        <AsyncBoundary
          loadingFallback={
            <ProductCardActionsFallback isConfigurable={isConfigurable} />
          }
        >
          <ProductCardActionsContent {...props} />
        </AsyncBoundary>
      ) : (
        <ProductCardActionsFallback isConfigurable={isConfigurable} />
      )}
    </div>
  );
};
