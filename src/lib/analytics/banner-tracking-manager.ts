"use client";

import { analyticsManager } from "@/lib/analytics/analytics-manager";
import { ANALYTICS_TOOL } from "@/lib/analytics/analytics-tool";
import { amplitudeProvider } from "@/lib/analytics/providers/amplitude-provider";

interface BannerClicks {
  [key: `clicks.${string}`]: number;
}

/**
 * Banner tracking data structure
 */
interface BannerViews {
  [key: `views.${string}`]: number;
}

/**
 * Last clicked banner information
 * Used to attach banner attributes to add_to_cart events
 */
interface LastClickedBanner {
  categoryId?: string;
  elementId: string;
  innerPosition?: number;
  lpId?: string;
  origin?: "lp" | "pdp" | "plp";
  style?: "grid" | "horizontal" | "list" | "paged";
  type?: "banner-slider" | "banner" | "banners-in-grid";
}

/**
 * Banner Tracking Manager
 * Manages batching and sending of banner view/click events to Amplitude
 * - Batches up to 10 entries in banner_views before sending
 * - Flushes data on navigation
 * - Only sends to Amplitude (not other providers)
 * - Tracks last clicked banner for add_to_cart event attribution
 */
class BannerTrackingManager {
  private bannerClicks: Map<string, number> = new Map();
  private bannerViews: Map<string, number> = new Map();
  private lastClickedBanner: LastClickedBanner | null = null;
  private readonly MAX_BATCH_SIZE = 10;

  /**
   * Flush all pending banner data and send to Amplitude
   * Called when:
   * - Batch size reaches MAX_BATCH_SIZE
   * - User navigates to another page
   */
  flush(): void {
    // Build banner_views object
    const bannerViews: BannerViews = {};
    this.bannerViews.forEach((count, elementId) => {
      bannerViews[`views.${elementId}` as const] = count;
    });

    // Build banner_clicks object
    const bannerClicks: BannerClicks = {};
    this.bannerClicks.forEach((count, elementId) => {
      bannerClicks[`clicks.${elementId}` as const] = count;
    });

    // Only send event if at least one object has values
    const hasViews = Object.keys(bannerViews).length > 0;
    const hasClicks = Object.keys(bannerClicks).length > 0;

    if (!hasViews && !hasClicks) {
      return;
    }

    // Build event properties - only include keys that have values
    const eventProperties: Record<string, unknown> = {};
    if (hasViews) {
      eventProperties.banner_views = JSON.stringify(bannerViews);
    }
    if (hasClicks) {
      eventProperties.banner_clicks = JSON.stringify(bannerClicks);
    }

    // Send event to Amplitude only
    if (
      analyticsManager.isToolEnabled(ANALYTICS_TOOL.AMPLITUDE) &&
      amplitudeProvider.isAvailable()
    ) {
      amplitudeProvider.track("view_banner", eventProperties);
    }

    // Clear the maps after sending
    this.bannerViews.clear();
    this.bannerClicks.clear();
  }

  /**
   * Get current batch size
   */
  getBatchSize(): number {
    return this.bannerViews.size;
  }

  /**
   * Get last clicked banner information
   * Returns null if no banner was clicked or if it was reset
   */
  getLastClickedBanner(): LastClickedBanner | null {
    return this.lastClickedBanner;
  }

  /**
   * Reset last clicked banner information
   * Called when other events happen (except view_product in PLP)
   */
  resetLastClickedBanner(): void {
    this.lastClickedBanner = null;
  }

  /**
   * Update the category id for the last clicked banner
   * Called when a category page loads and we have the category id available
   * @param categoryId - Category id from the category page
   */
  setLastClickedBannerCategoryId(categoryId: string): void {
    if (this.lastClickedBanner && !this.lastClickedBanner.categoryId) {
      this.lastClickedBanner.categoryId = categoryId;
    }
  }

  /**
   * Track a banner click
   * @param elementId - Banner element ID from Contentful
   * @param options - Optional banner metadata
   */
  trackClick(
    elementId: string,
    options?: {
      categoryId?: string;
      innerPosition?: number;
      lpId?: string;
      origin?: "lp" | "pdp" | "plp";
      style?: "grid" | "horizontal" | "list" | "paged";
      type?: "banner-slider" | "banner" | "banners-in-grid";
    }
  ): void {
    if (!elementId) return;

    const currentClicks = this.bannerClicks.get(elementId) || 0;
    this.bannerClicks.set(elementId, currentClicks + 1);

    // Store last clicked banner info for add_to_cart attribution
    this.lastClickedBanner = {
      categoryId: options?.categoryId,
      elementId,
      innerPosition: options?.innerPosition,
      lpId: options?.lpId,
      origin: options?.origin,
      style: options?.style,
      type: options?.type,
    };
  }

  /**
   * Track a banner view (when banner becomes visible in viewport)
   */
  trackView(elementId: string): void {
    if (!elementId) return;

    const currentViews = this.bannerViews.get(elementId) || 0;
    this.bannerViews.set(elementId, currentViews + 1);

    // Send event if batch is full
    if (this.bannerViews.size >= this.MAX_BATCH_SIZE) {
      this.flush();
    }
  }
}

// Export singleton instance
export const bannerTrackingManager = new BannerTrackingManager();
