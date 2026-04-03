"use client";

import { useRef } from "react";

import dynamic from "next/dynamic";

import { MobileSearchDialogFallback } from "@/components/search/mobile-search/mobile-search-dialog-fallback";
import { useSearch } from "@/components/search/search-container";

const MobileSearchDialog = dynamic(
  () =>
    import("@/components/search/mobile-search/mobile-search-dialog").then(
      (module) => module.MobileSearchDialog
    ),
  {
    loading: () => <MobileSearchDialogFallback />,
  }
);

export function DeferredMobileSearchDialog({
  isMobile,
}: {
  isMobile: boolean;
}) {
  const { showMobileSearch } = useSearch();
  const hasOpenedRef = useRef(false);

  if (showMobileSearch) {
    hasOpenedRef.current = true;
  }

  const shouldRenderDialog =
    isMobile && (hasOpenedRef.current || showMobileSearch);

  if (!shouldRenderDialog) {
    return null;
  }

  return <MobileSearchDialog />;
}
