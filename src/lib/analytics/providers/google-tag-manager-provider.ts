import "client-only";

import { sendGTMEvent } from "@next/third-parties/google";

import { clickOriginTrackingManager } from "@/lib/analytics/click-origin-tracking-manager";
import { ANALYTICS_TOOL } from "@/lib/analytics/constants/analytics-tool";
import {
  AnalyticsProvider,
  type AnalyticsTrackContext,
} from "@/lib/analytics/providers/base-provider";
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
import { getLocaleInfo } from "@/lib/utils/locale";

type GtmTrackProperties = Record<string, boolean | number | string>;

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

  track(
    eventName: string,
    properties?: Record<string, unknown>,
    context?: AnalyticsTrackContext
  ): void {
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
      const flattenedProperties = flattenGAProperties(groupedProperties, "", {
        replaceDotsWithUnderscores: false,
      });
      const providerProperties = {
        ...flattenedProperties,
        ...this.buildProviderEventProperties(eventName, flattenedProperties),
      };

      // Add Snap CAPI v3 params for GTM (for Snapchat Conversions API forwarding)
      const sharedCdid = mergedProperties[SNAP_CAPI_CDID_KEY] as
        | string
        | undefined;
      void this.sendTrackWithSnapParams(
        eventName,
        providerProperties,
        sharedCdid,
        context?.canonicalEventName
      ).catch((error) => {
        console.error("Google Tag Manager track error (Snap CAPI):", error);
      });
    } catch (error) {
      console.error("Google Tag Manager track error:", error);
    }
  }

  /**
   * Push a GA4 ecommerce event to the dataLayer.
   * Clears the previous ecommerce object first (standard GA4 practice) then
   * pushes the event with the full nested ecommerce payload intact — bypassing
   * the property-flattening used by the regular track() method.
   */
  trackEcommerce(
    eventName: string,
    ecommerce: Record<string, unknown>,
    additionalFields?: Record<string, unknown>
  ): void {
    if (!this.isAvailable()) return;

    try {
      // Clear any previous ecommerce data
      sendGTMEvent({ ecommerce: null, event: `${eventName}_clear` });
      sendGTMEvent({ ecommerce, event: eventName, ...additionalFields });
    } catch (error) {
      console.error("Google Tag Manager trackEcommerce error:", error);
    }
  }

  private buildProviderEventProperties(
    eventName: string,
    properties: GtmTrackProperties
  ): GtmTrackProperties {
    switch (eventName) {
      case "view_cart":
        return this.buildViewCartProperties(properties);
      case "view_product":
        return this.buildViewProductProperties(properties);
      default:
        return {};
    }
  }

  private buildViewCartProperties(
    properties: GtmTrackProperties
  ): GtmTrackProperties {
    const eventProperties: GtmTrackProperties = {
      store_code: this.getGtmStoreCode(),
    };
    const cartTotal = this.getProperty(properties, [
      "cart.grandTotal",
      "cart.total",
      "cart_total",
    ]);

    if (cartTotal !== undefined) {
      eventProperties.cart_total = cartTotal;
    }

    this.getProductSkus(properties).forEach((sku, index) => {
      eventProperties[`ProductBasketProducts.${index}`] = sku;
    });

    return eventProperties;
  }

  private buildViewProductProperties(
    properties: GtmTrackProperties
  ): GtmTrackProperties {
    const productId = this.getStringProperty(properties, [
      "ProductID",
      "product_ID",
      "product.id",
      "product_id",
    ]);
    const visitorEmail = this.getStringProperty(properties, [
      "visitorEmail",
      "user.email",
      "user_email",
    ]);
    const visitorPhone = this.getStringProperty(properties, [
      "visitorPhone",
      "user.phone",
      "user_phone",
    ]);
    const eventProperties: GtmTrackProperties = {
      store_code: this.getGtmStoreCode(),
    };

    if (productId) {
      eventProperties.ProductID = productId;
      eventProperties.product_ID = productId;
    }

    if (visitorEmail) {
      eventProperties.visitorEmail = visitorEmail;
    }

    if (visitorPhone) {
      eventProperties.visitorPhone =
        visitorPhone.replace(/\D/g, "") || visitorPhone;
    }

    return eventProperties;
  }

  private getGtmStoreCode(): string {
    const { region } = getLocaleInfo(this.locale ?? undefined);

    return region.toLowerCase();
  }

  private getProductSkus(properties: GtmTrackProperties): string[] {
    return Array.from(
      new Set(
        Object.entries(properties)
          .filter(([key]) => key.startsWith("product.") && key.endsWith(".sku"))
          .map(([, value]) => this.getStringValue(value))
          .filter((sku): sku is string => Boolean(sku))
      )
    );
  }

  private getProperty(
    properties: GtmTrackProperties,
    keys: string[]
  ): boolean | number | string | undefined {
    for (const key of keys) {
      const value = properties[key];

      if (value !== undefined && value !== "") {
        return value;
      }
    }

    return undefined;
  }

  private getStringProperty(
    properties: GtmTrackProperties,
    keys: string[]
  ): string | undefined {
    for (const key of keys) {
      const value = this.getStringValue(properties[key]);

      if (value) {
        return value;
      }
    }

    return undefined;
  }

  private getStringValue(
    value: boolean | number | string | undefined
  ): string | undefined {
    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }

    return undefined;
  }

  private async sendTrackWithSnapParams(
    eventName: string,
    flattenedProperties: GtmTrackProperties,
    sharedCdid?: string,
    canonicalEventName = eventName
  ): Promise<void> {
    const snapParams = await buildSnapCapiParams(
      canonicalEventName,
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
