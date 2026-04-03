"use client";

import { useEffect, useRef } from "react";

import { trackFilterClose, trackFilterOpen } from "@/lib/analytics/events";

/**
 * Client component to track filter_open and filter_close events
 * Tracks when:
 * - Desktop: User expands/collapses any filter section (collapsible) - only on user interaction, not initial load
 * - Mobile: Individual filter action sheets open/close (drawer) - only on user interaction, not initial load
 *
 * Tracks every time a filter is opened or closed (transitions), not just the first time
 */
export function FilterTracker({
  isCollapsibleOpen,
  isDrawerOpen,
}: {
  isCollapsibleOpen?: boolean;
  isDrawerOpen?: boolean;
}) {
  const previousCollapsibleOpenRef = useRef<boolean | undefined>(undefined);
  const previousDrawerOpenRef = useRef<boolean | undefined>(undefined);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    // Skip tracking on initial mount (even if defaultOpen is true)
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      previousCollapsibleOpenRef.current = isCollapsibleOpen;
      previousDrawerOpenRef.current = isDrawerOpen;
      return;
    }

    // Track when desktop filter section transitions from closed to open (user interaction)
    if (isCollapsibleOpen && previousCollapsibleOpenRef.current === false) {
      trackFilterOpen();
    }

    // Track when desktop filter section transitions from open to closed (user interaction)
    if (!isCollapsibleOpen && previousCollapsibleOpenRef.current === true) {
      trackFilterClose();
    }

    // Track when mobile filter drawer transitions from closed to open (user interaction)
    if (isDrawerOpen && previousDrawerOpenRef.current === false) {
      trackFilterOpen();
    }

    // Track when mobile filter drawer transitions from open to closed (user interaction)
    if (!isDrawerOpen && previousDrawerOpenRef.current === true) {
      trackFilterClose();
    }

    // Update previous values
    previousCollapsibleOpenRef.current = isCollapsibleOpen;
    previousDrawerOpenRef.current = isDrawerOpen;
  }, [isCollapsibleOpen, isDrawerOpen]);

  return null;
}
