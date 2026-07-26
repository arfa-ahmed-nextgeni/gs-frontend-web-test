"use client";

import { useEffect, useRef } from "react";

import { trackSearchInit } from "@/lib/analytics/events";

/**
 * Client component to track search_init event
 * Placed in search page to track when search screen is presented
 * Only tracks once per page load
 */
export function SearchTracker({
  asCatalogView,
  trackInit,
}: {
  asCatalogView?: boolean;
  trackInit: boolean;
}) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per page load
    if (hasTracked.current || !trackInit) {
      return;
    }

    trackSearchInit({ asCatalogView });
    hasTracked.current = true;

    return () => {
      hasTracked.current = false;
    };
  }, [asCatalogView, trackInit]);

  return null;
}
