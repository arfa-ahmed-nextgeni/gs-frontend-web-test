"use client";

import { useEffect, useState } from "react";

import dynamic from "next/dynamic";

import { ProductActionButtons } from "@/components/product/product-action-buttons";
import { useProductDetails } from "@/contexts/product-details-context";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useWindowScrollThreshold } from "@/hooks/use-window-scroll-threshold";
import { ProductType } from "@/lib/constants/product/product-details";

const DESKTOP_STICKY_LOAD_SCROLL_THRESHOLD = 560;
const DESKTOP_STICKY_VISIBLE_SCROLL_THRESHOLD = 670;

const StickyAddToCartDesktop = dynamic(
  () =>
    import("@/components/product/sticky-add-to-cart-desktop").then(
      (mod) => mod.StickyAddToCartDesktop
    ),
  {
    loading: () => null,
  }
);

export const StickyAddToCart = () => {
  const { product } = useProductDetails();
  const isMobile = useIsMobile();
  const hasReachedDesktopLoadThreshold = useWindowScrollThreshold(
    DESKTOP_STICKY_LOAD_SCROLL_THRESHOLD
  );
  const isDesktopVisible = useWindowScrollThreshold(
    DESKTOP_STICKY_VISIBLE_SCROLL_THRESHOLD
  );

  const [shouldLoadDesktop, setShouldLoadDesktop] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setShouldLoadDesktop(false);
      return;
    }

    if (hasReachedDesktopLoadThreshold) {
      setShouldLoadDesktop(true);
    }
  }, [hasReachedDesktopLoadThreshold, isMobile]);

  if ([ProductType.EGiftCard].includes(product.type) && !isMobile) {
    return null;
  }

  return (
    <>
      <div className="bg-bg-default border-border-base h-17.5 fixed inset-x-0 bottom-0 flex flex-row items-center justify-between border-t px-5 lg:hidden">
        <div className="gap-12.5 flex flex-1 flex-row">
          <ProductActionButtons layout="sticky" />
        </div>
      </div>
      {!isMobile && shouldLoadDesktop ? (
        <StickyAddToCartDesktop isVisible={isDesktopVisible} />
      ) : null}
    </>
  );
};
