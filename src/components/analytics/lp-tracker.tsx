"use client";

import { useEffect, useEffectEvent, useRef } from "react";

import { trackViewLp } from "@/lib/analytics/events";

import type { LpProperties } from "@/lib/analytics/models/event-models";

interface LpTrackerProps {
  lp: Partial<LpProperties>;
}

/**
 * Client component to track landing page view event
 * Placed in landing page to track when users view a landing page
 * Only tracks once per page load
 */
export function LpTracker({ lp }: LpTrackerProps) {
  const hasTracked = useRef(false);

  const trackLpEvent = useEffectEvent(() => {
    if (hasTracked.current) {
      return;
    }

    trackViewLp(lp);
    hasTracked.current = true;
  });

  useEffect(() => {
    trackLpEvent();

    return () => {
      hasTracked.current = false;
    };
  }, []);

  return null;
}
