import "client-only";

import { sendGAEvent } from "@next/third-parties/google";

import { clickOriginTrackingManager } from "@/lib/analytics/click-origin-tracking-manager";
import { ANALYTICS_TOOL } from "@/lib/analytics/constants/analytics-tool";
import { AnalyticsProvider } from "@/lib/analytics/providers/base-provider";
import { buildMetaProperties } from "@/lib/analytics/utils/build-meta-properties";
import { flattenGAProperties } from "@/lib/analytics/utils/flatten-ga-properties";
import { groupPropertiesByPrefix } from "@/lib/analytics/utils/group-properties-by-prefix";
import { serializeClickOrigin } from "@/lib/analytics/utils/serialize-click-origin";
import {
  buildSnapCapiParams,
  SNAP_CAPI_CDID_KEY,
  type SnapCapiUserData,
} from "@/lib/analytics/utils/snap-capi-params";
import {
  GOOGLE_ANALYTICS_DEBUG_MODE,
  GOOGLE_ANALYTICS_ID,
} from "@/lib/config/client-env";

/**
 * Flag to control whether to send nested objects directly to GA4
 * WARNING: GA4 doesn't support nested objects - they will appear as "[object Object]"
 * Set to true only for testing purposes
 */
const SEND_NESTED_OBJECTS_TO_GA4 = false;

/** Max time to wait for gtag (ms); checks run in idle/delayed callbacks, not blocking */
const GTAG_WAIT_TIMEOUT_MS = 5000;
/** Interval between checks when not using requestIdleCallback (ms) */
const GTAG_CHECK_INTERVAL_MS = 100;

/**
 * Google Analytics Provider
 * Implements the AnalyticsProvider interface using gtag.js (Google Analytics 4)
 * Follows Next.js official setup: https://nextjs.org/docs/app/guides/third-party-libraries#google-analytics
 */
class GoogleAnalyticsProvider implements AnalyticsProvider {
  public tool = ANALYTICS_TOOL.GOOGLE_ANALYTICS;
  private gtagConfigScheduled = false;
  private initPromise: null | Promise<void> = null;
  private isInitialized = false;
  private locale: null | string = null;
  private snapCapiUserData: SnapCapiUserData = {};

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.isAvailable()) return;

    try {
      // Set user_id for GA4
      // gtag is dynamically created by Google Analytics script
      const gtag = (
        window as unknown as { gtag?: (...args: unknown[]) => void }
      ).gtag;
      if (!gtag) return;

      gtag("config", GOOGLE_ANALYTICS_ID, {
        user_id: userId,
      });

      // Set user properties if provided
      if (traits && Object.keys(traits).length > 0) {
        gtag("set", "user_properties", traits);
      }
    } catch (error) {
      console.error("Google Analytics identify error:", error);
    }
  }

  async initialize(locale?: string): Promise<void> {
    // Skip if already initialized or not in browser
    if (this.isInitialized || typeof window === "undefined") return;

    // Return existing promise if initialization is in progress
    if (this.initPromise) return this.initPromise;

    // Store locale if provided
    if (locale) {
      this.locale = locale;
    }

    // Same pattern as Amplitude: resolve quickly so the manager's Promise.all
    // and flushEventQueue() are not blocked. gtag is loaded by @next/third-parties
    // after hydration; we check at send-time in isAvailable() and only send when gtag exists.
    this.initPromise = (async () => {
      try {
        if (!GOOGLE_ANALYTICS_ID) {
          console.warn("Google Analytics ID is not configured");
          return;
        }

        // Mark provider init complete so the manager can proceed.
        this.isInitialized = true;

        // If gtag is already available, config GA4 now
        const gtag = (
          window as unknown as { gtag?: (...args: unknown[]) => void }
        ).gtag;
        if (gtag) {
          gtag("config", GOOGLE_ANALYTICS_ID, {
            page_path: window.location.pathname,
          });
        } else {
          // gtag not loaded yet (script loads after hydration). Check in background
          // using requestIdleCallback/setTimeout so we never block the main thread.
          this.scheduleGtagConfigWhenReady();
        }
      } catch (error) {
        console.error("Failed to initialize Google Analytics:", error);
      }
    })();

    return this.initPromise;
  }

  isAvailable(): boolean {
    return (
      this.isInitialized &&
      typeof window !== "undefined" &&
      typeof (window as { gtag?: unknown }).gtag !== "undefined" &&
      !!GOOGLE_ANALYTICS_ID
    );
  }

  page(name: string, properties?: Record<string, unknown>): void {
    if (!this.isAvailable()) return;

    try {
      const pageProperties = {
        page_location: window.location.href,
        page_path: window.location.pathname,
        page_title: name,
        ...properties,
      };

      // Flatten nested objects for GA4
      const flattenedProperties = flattenGAProperties(pageProperties);

      sendGAEvent("event", "page_view", flattenedProperties);
    } catch (error) {
      console.error("Google Analytics page error:", error);
    }
  }

  resetUser(): void {
    if (!this.isAvailable()) return;

    try {
      this.snapCapiUserData = {};

      // gtag is dynamically created by Google Analytics script
      const gtag = (
        window as unknown as { gtag?: (...args: unknown[]) => void }
      ).gtag;
      if (!gtag) return;

      // Clear user_id
      gtag("config", GOOGLE_ANALYTICS_ID, {
        user_id: null,
      });

      // Clear user properties
      gtag("set", "user_properties", {});
    } catch (error) {
      console.error("Google Analytics resetUser error:", error);
    }
  }

  setSnapCapiUserData(firstName?: string, lastName?: string): void {
    this.snapCapiUserData = { firstName, lastName };
  }

  track(eventName: string, properties?: Record<string, unknown>): void {
    if (!this.isAvailable()) return;

    try {
      // Get click origin for internal source tracking
      const clickOrigin = clickOriginTrackingManager.getClickOrigin();
      const clickOriginProps = serializeClickOrigin(clickOrigin);

      // Get meta properties (country, language, is_guest, is_dummy)
      const metaProperties = buildMetaProperties(this.locale);

      // Merge properties: meta -> click origin -> event properties
      // Event properties take highest precedence
      const mergedProperties: Record<string, unknown> = {
        ...metaProperties,
        ...clickOriginProps,
        ...properties,
        debug_mode: GOOGLE_ANALYTICS_DEBUG_MODE,
      };

      // Group properties by prefix (e.g., meta.* -> meta: { ... })
      // This creates a cleaner nested structure
      const groupedProperties = groupPropertiesByPrefix(mergedProperties);

      let propertiesToSend: Record<string, unknown>;

      if (SEND_NESTED_OBJECTS_TO_GA4) {
        // Send nested objects directly (for testing - GA4 doesn't support this)
        // They will appear as "[object Object]" in GA4 interface
        propertiesToSend = groupedProperties;
      } else {
        // Flatten nested objects for GA4 - GA4 doesn't support nested objects
        // They appear as "[object Object]" in the GA interface
        // Also convert dots to underscores in parameter names (GA4 doesn't support dots)
        propertiesToSend = flattenGAProperties(groupedProperties);
      }

      // Add Snap CAPI v3 params for GA4 (for Snapchat Conversions API forwarding)
      const sharedCdid = mergedProperties[SNAP_CAPI_CDID_KEY] as
        | string
        | undefined;
      void this.sendTrackWithSnapParams(
        eventName,
        propertiesToSend,
        sharedCdid
      ).catch((error) => {
        console.error("Google Analytics track error (Snap CAPI):", error);
      });
    } catch (error) {
      console.error("Google Analytics track error:", error);
    }
  }

  /**
   * Check for gtag in idle/delayed callbacks (non-blocking). When gtag appears, run config.
   * Web Workers cannot access window, so this must run on the main thread; we avoid
   * blocking by yielding between checks via requestIdleCallback or setTimeout.
   */
  private scheduleGtagConfigWhenReady(): void {
    if (this.gtagConfigScheduled || typeof window === "undefined") return;
    this.gtagConfigScheduled = true;

    const start = Date.now();

    const schedule = (cb: () => void) => {
      if (typeof window === "undefined") return;
      const w = window as unknown as {
        requestIdleCallback?: (
          cb: () => void,
          opts?: { timeout: number }
        ) => number;
      };
      if (typeof w.requestIdleCallback === "function") {
        w.requestIdleCallback(cb, { timeout: GTAG_CHECK_INTERVAL_MS });
      } else {
        setTimeout(cb, GTAG_CHECK_INTERVAL_MS);
      }
    };

    const check = () => {
      if (Date.now() - start > GTAG_WAIT_TIMEOUT_MS) return;

      const gtag = (
        window as unknown as { gtag?: (...args: unknown[]) => void }
      ).gtag;
      if (gtag) {
        gtag("config", GOOGLE_ANALYTICS_ID, {
          page_path: window.location.pathname,
        });
        return;
      }

      schedule(check);
    };

    schedule(check);
  }

  private async sendTrackWithSnapParams(
    eventName: string,
    propertiesToSend: Record<string, unknown>,
    sharedCdid?: string
  ): Promise<void> {
    const snapParams = await buildSnapCapiParams(
      eventName,
      this.snapCapiUserData,
      sharedCdid
    );
    const rest = Object.fromEntries(
      Object.entries(propertiesToSend).filter(
        ([key]) => key !== SNAP_CAPI_CDID_KEY
      )
    );
    const finalProperties = snapParams
      ? {
          ...rest,
          cdid: snapParams.cdid,
          ...(snapParams.fn && { fn: snapParams.fn }),
          ...(snapParams.ln && { ln: snapParams.ln }),
          ...(snapParams.ua && { ua: snapParams.ua }),
        }
      : rest;

    sendGAEvent("event", eventName, finalProperties);
  }
}

export const googleAnalyticsProvider = new GoogleAnalyticsProvider();
