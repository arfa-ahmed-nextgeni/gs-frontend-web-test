"use client";

import { lazy, type ReactNode, Suspense } from "react";

import { useWindowSize } from "@/hooks/use-window-size";
import { TAILWIND_BREAKPOINTS, ZIndexLevel } from "@/lib/constants/ui";

const DesktopHeaderActions = lazy(() =>
  import("@/layouts/header/desktop-header-actions").then((module) => ({
    default: module.DesktopHeaderActions,
  }))
);

export const DeferredDesktopHeaderActions = ({
  fallback,
  hoverZIndexLevel,
  isSticky,
}: {
  fallback: ReactNode;
  hoverZIndexLevel: ZIndexLevel;
  isSticky: boolean;
}) => {
  const { width } = useWindowSize();
  const shouldRenderDesktopActions =
    width !== undefined && width >= TAILWIND_BREAKPOINTS.lg;

  if (!shouldRenderDesktopActions) {
    return fallback;
  }

  return (
    <Suspense fallback={fallback}>
      <DesktopHeaderActions
        hoverZIndexLevel={hoverZIndexLevel}
        isSticky={isSticky}
      />
    </Suspense>
  );
};
