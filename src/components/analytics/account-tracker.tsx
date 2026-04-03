"use client";

import { useEffect, useRef } from "react";

import { trackViewAccount } from "@/lib/analytics/events";

/**
 * Client component to track account page view event
 * Placed in account page to track when users visit my account section
 */
export function AccountTracker() {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;

    trackViewAccount();
    hasTracked.current = true;

    return () => {
      hasTracked.current = false;
    };
  }, []);

  return null;
}
