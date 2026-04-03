import "client-only";

import { sendGTMEvent } from "@next/third-parties/google";

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
  GOOGLE_TAG_MANAGER_ID,
} from "@/lib/config/client-env";

/**
 * Google Tag Manager Provider
 * Sends the same events as Amplitude and GA via sendGTMEvent so GTM can forward them
 * (e.g. to GA4, Amplitude, or other tags).
 * Requires GoogleTagManager component to be included in layout (e.g. GoogleTagManagerWrapper).
 */
class GoogleTagManagerProvider implements AnalyticsProvider {
  public tool = ANALYTICS_TOOL.GOOGLE_TAG_MANAGER;
  private isInitialized = false;
  private locale: null | string = null;
  private snapCapiUserData: SnapCapiUserData = {};

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.isAvailable()) return;

    try {
      sendGTMEvent({
        event: "user_identified",
        user_id: userId,
        ...(traits && Object.keys(traits).length > 0 ? traits : {}),
      });
    } catch (error) {
      console.error("Google Tag Manager identify error:", error);
    }
  }

  async initialize(locale?: string): Promise<void> {
    if (this.isInitialized || typeof window === "undefined") return;

    if (locale) {
      this.locale = locale;
    }

    try {
      if (!GOOGLE_TAG_MANAGER_ID) {
        console.warn("Google Tag Manager ID is not configured");
        return;
      }

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize Google Tag Manager provider:", error);
    }
  }

  isAvailable(): boolean {
    return (
      this.isInitialized &&
      typeof window !== "undefined" &&
      !!GOOGLE_TAG_MANAGER_ID
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

      const flattenedProperties = flattenGAProperties(pageProperties);

      sendGTMEvent({
        event: "page_view",
        ...flattenedProperties,
      });
    } catch (error) {
      console.error("Google Tag Manager page error:", error);
    }
  }

  resetUser(): void {
    if (!this.isAvailable()) return;

    try {
      this.snapCapiUserData = {};
      sendGTMEvent({ event: "user_reset", user_id: null, user_properties: {} });
    } catch (error) {
      console.error("Google Tag Manager resetUser error:", error);
    }
  }

  setSnapCapiUserData(firstName?: string, lastName?: string): void {
    this.snapCapiUserData = { firstName, lastName };
  }

  track(eventName: string, properties?: Record<string, unknown>): void {
    if (!this.isAvailable()) return;

    try {
      const clickOrigin = clickOriginTrackingManager.getClickOrigin();
      const clickOriginProps = serializeClickOrigin(clickOrigin);
      const metaProperties = buildMetaProperties(this.locale);

      const mergedProperties: Record<string, unknown> = {
        ...metaProperties,
        ...clickOriginProps,
        ...properties,
        debug_mode: GOOGLE_ANALYTICS_DEBUG_MODE,
      };

      const groupedProperties = groupPropertiesByPrefix(mergedProperties);
      const flattenedProperties = flattenGAProperties(groupedProperties);

      // Add Snap CAPI v3 params for GTM (for Snapchat Conversions API forwarding)
      const sharedCdid = mergedProperties[SNAP_CAPI_CDID_KEY] as
        | string
        | undefined;
      void this.sendTrackWithSnapParams(
        eventName,
        flattenedProperties,
        sharedCdid
      ).catch((error) => {
        console.error("Google Tag Manager track error (Snap CAPI):", error);
      });
    } catch (error) {
      console.error("Google Tag Manager track error:", error);
    }
  }

  private async sendTrackWithSnapParams(
    eventName: string,
    flattenedProperties: Record<string, boolean | number | string>,
    sharedCdid?: string
  ): Promise<void> {
    const snapParams = await buildSnapCapiParams(
      eventName,
      this.snapCapiUserData,
      sharedCdid
    );
    const rest = Object.fromEntries(
      Object.entries(flattenedProperties).filter(
        ([key]) => key !== SNAP_CAPI_CDID_KEY
      )
    );
    const gtmPayload = snapParams
      ? {
          ...rest,
          cdid: snapParams.cdid,
          ...(snapParams.fn && { fn: snapParams.fn }),
          ...(snapParams.ln && { ln: snapParams.ln }),
          ...(snapParams.ua && { ua: snapParams.ua }),
        }
      : rest;

    sendGTMEvent({
      event: eventName,
      ...gtmPayload,
    });
  }
}

export const googleTagManagerProvider = new GoogleTagManagerProvider();
