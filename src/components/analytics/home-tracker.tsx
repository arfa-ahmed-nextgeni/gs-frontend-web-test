"use client";

import { useEffect, useRef } from "react";

import { trackHome } from "@/lib/analytics/events";

/**
 * Client component to track home page view event
 * Placed in home page to track when users visit the home page
 */
export function HomeTracker() {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      trackHome();
      hasTracked.current = true;
    }

    return () => {
      hasTracked.current = false;
    };
  }, []);

  return null;
}
