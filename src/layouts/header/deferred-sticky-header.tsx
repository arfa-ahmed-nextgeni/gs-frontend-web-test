"use client";

import { PropsWithChildren, useEffect, useState } from "react";

import { useResponsiveValue } from "@/hooks/use-responsive-value";
import { useWindowScrollThreshold } from "@/hooks/use-window-scroll-threshold";

export const DeferredStickyHeader = ({ children }: PropsWithChildren) => {
  const topOffset = useResponsiveValue({ lg: 160 }, 100);
  const hasScrolledPastTopOffset = useWindowScrollThreshold(topOffset);
  const [shouldRenderStickyHeader, setShouldRenderStickyHeader] =
    useState(false);

  useEffect(() => {
    if (hasScrolledPastTopOffset) {
      setShouldRenderStickyHeader(true);
    }
  }, [hasScrolledPastTopOffset]);

  if (!shouldRenderStickyHeader) {
    return null;
  }

  return children;
};
