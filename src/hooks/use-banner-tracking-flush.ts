"use client";

import { useEffect } from "react";

import { usePathname } from "@/i18n/navigation";
import { bannerTrackingManager } from "@/lib/analytics/banner-tracking-manager";

/**
 * Hook to flush banner tracking data on navigation
 * Should be used in a layout or root component to ensure data is sent
 * when user navigates to another page
 */
export function useBannerTrackingFlush() {
  const pathname = usePathname();

  useEffect(() => {
    // Flush pending banner data when pathname changes (navigation)
    bannerTrackingManager.flush();
  }, [pathname]);
}
