"use client";

import { PropsWithChildren, useLayoutEffect, useState } from "react";

import {
  type FlashSaleVisibilityInput,
  getFlashSaleVisibility,
} from "@/components/product/flash-sale-section/flash-sale-visibility";

export const FlashSaleContainer = ({
  children,
  visibility,
}: PropsWithChildren<{
  visibility: FlashSaleVisibilityInput;
}>) => {
  const { endTime, hasContent, startTime } = visibility;
  const [shouldRender, setShouldRender] = useState(false);

  useLayoutEffect(() => {
    let timeoutId: null | number = null;

    const syncVisibility = () => {
      const nextVisibility = getFlashSaleVisibility(
        { endTime, hasContent, startTime },
        Date.now()
      );
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
  }, [endTime, hasContent, startTime]);

  if (shouldRender) {
    return children;
  }

  return null;
};
