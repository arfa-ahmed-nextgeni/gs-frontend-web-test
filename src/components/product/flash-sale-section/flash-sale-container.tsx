"use client";

import { PropsWithChildren, useLayoutEffect, useState } from "react";

import { getFlashSaleVisibility } from "@/components/product/flash-sale-section/flash-sale-visibility";
import { FlashSale } from "@/lib/models/flash-sale";

export const FlashSaleContainer = ({
  children,
  flashSale,
}: PropsWithChildren<{
  flashSale: FlashSale;
}>) => {
  const [shouldRender, setShouldRender] = useState(false);

  useLayoutEffect(() => {
    let timeoutId: null | number = null;

    const syncVisibility = () => {
      const nextVisibility = getFlashSaleVisibility(flashSale, Date.now());
      setShouldRender(nextVisibility.shouldRender);

      if (nextVisibility.nextTransitionAt === null) {
        return;
      }

      const delayMs = Math.max(nextVisibility.nextTransitionAt - Date.now(), 0);
      timeoutId = window.setTimeout(syncVisibility, delayMs);
    };

    syncVisibility();

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [
    flashSale,
    flashSale.endTime,
    flashSale.products,
    flashSale.saleProductCategoryId,
    flashSale.startTime,
  ]);

  if (shouldRender) {
    return children;
  }

  return null;
};
