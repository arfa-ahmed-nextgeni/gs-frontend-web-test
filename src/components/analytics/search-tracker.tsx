"use client";

import { useEffect, useRef } from "react";

import { trackSearchInit } from "@/lib/analytics/events";

/**
 * Client component to track search_init event
 * Placed in search page to track when search screen is presented
 * Only tracks once per page load
 */
export function SearchTracker({ trackInit }: { trackInit: boolean }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per page load
    if (hasTracked.current || !trackInit) {
      return;
    }

    trackSearchInit();
    hasTracked.current = true;

    return () => {
      hasTracked.current = false;
    };
  }, [trackInit]);

  return null;
}
