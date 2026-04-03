"use client";

import { useEffect, useEffectEvent, useRef } from "react";

import { bannerTrackingManager } from "@/lib/analytics/banner-tracking-manager";
import { trackViewCategory } from "@/lib/analytics/events";

import type { CategoryProperties } from "@/lib/analytics/models/event-models";

interface CategoryTrackerProps {
  category: Partial<CategoryProperties>;
}

/**
 * Client component to track category page view event
 * Placed in category page to track when users view a category/PLP
 * Only tracks once per page load, even if filters change
 * Also updates the last clicked banner's category UID if available
 */
export function CategoryTracker({ category }: CategoryTrackerProps) {
  const hasTracked = useRef(false);

  const trackCategoryEvent = useEffectEvent(() => {
    if (hasTracked.current) {
      return;
    }

    trackViewCategory(category);
    hasTracked.current = true;
  });

  useEffect(() => {
    trackCategoryEvent();

    return () => {
      hasTracked.current = false;
    };
  }, []);

  // Update banner tracking whenever category id is available
  const updateBannerTrackingEvent = useEffectEvent(() => {
    // If there's a last clicked banner without a category id, update it
    // This happens when user clicks a banner on landing page and navigates to category page
    const categoryId = category["category.id"];
    if (categoryId) {
      bannerTrackingManager.setLastClickedBannerCategoryId(categoryId);
    }
  });

  useEffect(() => {
    updateBannerTrackingEvent();
  }, []);

  return null;
}
