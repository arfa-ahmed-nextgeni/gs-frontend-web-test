"use client";

import { useEffect, useRef } from "react";

import { trackCsOpen } from "@/lib/analytics/events";

/**
 * Fires cs_open analytics when the customer service route is shown.
 * Mount this in the customer-service page so tracking runs once per open.
 */
export function CustomerServiceTrackOpen() {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      trackCsOpen();
      hasTracked.current = true;
    }

    return () => {
      hasTracked.current = false;
    };
  }, []);

  return null;
}
