"use client";

import { createContext, type PropsWithChildren, useContext } from "react";

import { useProductCardVisibilityLoad } from "@/components/product/product-card/hooks/use-product-card-visibility-load";

const ProductCardCountdownVisibilityContext = createContext<boolean | null>(
  null
);

export const ProductCardCountdownVisibilityProvider = ({
  children,
}: PropsWithChildren) => {
  const { sentinelRef, shouldLoad } =
    useProductCardVisibilityLoad<HTMLSpanElement>({
      rootMargin: "120px 0px",
    });

  return (
    <ProductCardCountdownVisibilityContext.Provider value={shouldLoad}>
      {shouldLoad ? null : (
        <span aria-hidden className="sr-only" ref={sentinelRef} />
      )}
      {children}
    </ProductCardCountdownVisibilityContext.Provider>
  );
};

export const useProductCardCountdownVisibility = () =>
  useContext(ProductCardCountdownVisibilityContext);
