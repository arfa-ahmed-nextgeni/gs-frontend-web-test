import "client-only";

import { ANALYTICS_TOOL } from "@/lib/analytics/constants/analytics-tool";
import { AnalyticsProvider } from "@/lib/analytics/providers/base-provider";
import { buildMetaProperties } from "@/lib/analytics/utils/build-meta-properties";
import { SNAP_CAPI_CDID_KEY } from "@/lib/analytics/utils/snap-capi-params";
import { AMPLITUDE_API_KEY } from "@/lib/config/client-env";
import { SessionStorageKey } from "@/lib/constants/session-storage";
import {
  getSessionStorage,
  removeSessionStorage,
  setSessionStorage,
} from "@/lib/utils/session-storage";

/**
 * Amplitude Analytics Provider
 * Implements the AnalyticsProvider interface using @amplitude/unified SDK
 */
class AmplitudeAnalyticsProvider implements AnalyticsProvider {
  public tool = ANALYTICS_TOOL.AMPLITUDE;
  private amplitudeInstance:
    | null
    | typeof import("@amplitude/analytics-browser") = null;
  private initPromise: null | Promise<void> = null;
  private isInitialized = false;
  private locale: null | string = null;

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.isAvailable() || !this.amplitudeInstance) return;

    try {
      // Validate and pad user_id according to Amplitude requirements
      const validUserId = this.validateAndPadUserId(userId);
      if (validUserId) {
        this.amplitudeInstance.setUserId(validUserId);
        if (traits) {
          // Track user properties as an event since unified SDK identify requires IIdentify
          this.amplitudeInstance.track("User Identified", {
            user_id: validUserId,
            ...traits,
          });
        }
      }
    } catch (error) {
      console.error("Amplitude identify error:", error);
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

    this.initPromise = (async () => {
      try {
        // Dynamic import for code splitting (non-blocking)
        const amplitude = await import("@amplitude/analytics-browser");

        // Skip initialization if no API key is configured
        if (!AMPLITUDE_API_KEY) {
          console.warn("Amplitude API key is not configured");
          return;
        }

        await amplitude.init(AMPLITUDE_API_KEY, {
          autocapture: {
            attribution: true,
            elementInteractions: false,
            fileDownloads: false,
            formInteractions: false,
            pageUrlEnrichment: false,
            pageViews: false,
            sessions: true,
            webVitals: false,
          },
        });

        this.amplitudeInstance = amplitude;
        this.isInitialized = true;
      } catch (error) {
        console.error("Failed to initialize Amplitude:", error);
      }
    })();

    return this.initPromise;
  }

  isAvailable(): boolean {
    return this.isInitialized && typeof window !== "undefined";
  }

  page(name: string, properties?: Record<string, unknown>): void {
    if (!this.isAvailable() || !this.amplitudeInstance) return;

    try {
      this.amplitudeInstance.track("Page Viewed", {
        page_name: name,
        ...properties,
      });
    } catch (error) {
      console.error("Amplitude page error:", error);
    }
  }

  /**
   * Reset user properties and user_id (for logout)
   * Preserves device_id so the same device is tracked across logout/login
   * Only clears user_id and user properties, not device_id
   */
  resetUser(): void {
    if (!this.isAvailable() || !this.amplitudeInstance) return;

    try {
      // Clear user_id
      this.amplitudeInstance.setUserId(undefined);

      // Clear user properties using Identify API
      const identifyObj = new this.amplitudeInstance.Identify();
      identifyObj.clearAll();
      this.amplitudeInstance.identify(identifyObj);

      // Note: We intentionally do NOT call reset() here because it clears device_id
      // Preserving device_id allows Amplitude to merge events from the same device
      // across logout/login sessions under the same user profile

      removeSessionStorage(SessionStorageKey.AMPLITUDE_CAMPAIGN_DATA);
    } catch (error) {
      console.error("Amplitude resetUser error:", error);
    }
  }

  /**
   * Set the current locale
   * Called from AnalyticsManager when locale changes
   */
  setLocale(locale: string): void {
    this.locale = locale;
  }

  /**
   * Set user properties in Amplitude using Identify API
   * These properties are automatically attached to all subsequent events
   */
  setUserProperties(properties: Record<string, unknown>): void {
    if (!this.isAvailable() || !this.amplitudeInstance) return;

    try {
      const identifyObj = new this.amplitudeInstance.Identify();
      Object.entries(properties).forEach(([key, value]) => {
        // Cast value to ValidPropertyType (string | number | boolean | string[] | number[])
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean" ||
          Array.isArray(value)
        ) {
          identifyObj.set(key, value);
        }
      });
      // Validate and pad user_id according to Amplitude requirements
      const userId = properties["user.id"];
      const validUserId = this.validateAndPadUserId(
        typeof userId === "string" || typeof userId === "number"
          ? String(userId)
          : undefined
      );

      // Set user_id via setUserId() so it's used for all subsequent events (including launch)
      // This ensures the user_id is padded and persisted correctly
      if (validUserId) {
        this.amplitudeInstance.setUserId(validUserId);
      }

      // Only include user_id in options if we have a valid value
      const identifyOptions = validUserId ? { user_id: validUserId } : {};

      this.amplitudeInstance.identify(identifyObj, identifyOptions);
    } catch (error) {
      console.error("Amplitude setUserProperties error:", error);
    }
  }

  track(eventName: string, properties?: Record<string, unknown>): void {
    if (!this.isAvailable() || !this.amplitudeInstance) return;

    try {
      // Get campaign data from URL (if available) or from sessionStorage
      const urlCampaignData = this.getCampaignData();
      const storedCampaignData = this.getStoredCampaignData();

      // Use URL campaign data if available, otherwise use stored data
      const campaignData =
        Object.keys(urlCampaignData).length > 0
          ? urlCampaignData
          : storedCampaignData;

      // Get meta properties (country, language, is_guest, is_dummy)
      // Pass locale from provider to buildMetaProperties
      const metaProperties = buildMetaProperties(this.locale);

      // Merge properties in order: meta -> campaign -> event properties
      // Event properties take highest precedence, then campaign, then meta
      // Omit snapCapiCdid - only for GA4/GTM (Snap CAPI)
      const filteredProperties = Object.fromEntries(
        Object.entries(properties ?? {}).filter(
          ([key]) => key !== SNAP_CAPI_CDID_KEY
        )
      );
      this.amplitudeInstance.track(eventName, {
        ...metaProperties,
        ...campaignData,
        ...filteredProperties,
      });
    } catch (error) {
      console.error("Amplitude track error:", error);
    }
  }

  /**
   * Extract campaign data from URL parameters and document referrer
   * Returns campaign properties with campaign.* prefix pattern
   */
  private getCampaignData(): Record<string, unknown> {
    if (typeof window === "undefined") return {};

    const params = new URLSearchParams(window.location.search);
    const campaignData: Record<string, unknown> = {};

    // Extract UTM parameters with campaign.* prefix
    const utmCampaign = params.get("utm_campaign");
    const utmMedium = params.get("utm_medium");
    const utmSource = params.get("utm_source");
    const utmTerm = params.get("utm_term");
    const utmContent = params.get("utm_content");

    if (utmCampaign) campaignData["campaign.utm_campaign"] = utmCampaign;
    if (utmMedium) campaignData["campaign.medium"] = utmMedium;
    if (utmSource) campaignData["campaign.source"] = utmSource;
    if (utmTerm) campaignData["campaign.term"] = utmTerm;
    if (utmContent) campaignData["campaign.content"] = utmContent;

    // Extract referrer information
    if (document.referrer) {
      campaignData["campaign.referrer"] = document.referrer;
      try {
        const referrerUrl = new URL(document.referrer);
        campaignData["campaign.referring_domain"] = referrerUrl.hostname;
      } catch {
        // Invalid referrer URL, skip
      }
    }

    // Store in sessionStorage to persist across navigations
    if (Object.keys(campaignData).length > 0) {
      setSessionStorage(
        SessionStorageKey.AMPLITUDE_CAMPAIGN_DATA,
        JSON.stringify(campaignData)
      );
    }

    return campaignData;
  }

  /**
   * Get stored campaign data from sessionStorage
   * Used to persist campaign data across page navigations
   */
  private getStoredCampaignData(): Record<string, unknown> {
    if (typeof window === "undefined") return {};

    try {
      const stored = getSessionStorage(
        SessionStorageKey.AMPLITUDE_CAMPAIGN_DATA
      );
      if (stored) {
        return JSON.parse(stored) as Record<string, unknown>;
      }
    } catch {
      // Invalid JSON or sessionStorage not available
    }

    return {};
  }

  /**
   * Validate and pad user_id according to Amplitude requirements:
   * - Must be at least 5 characters long (pad if shorter)
   * - Cannot be empty string or invalid values like "null", "undefined", "0", etc.
   * - Returns undefined if invalid
   */
  private validateAndPadUserId(
    userId: null | string | undefined
  ): string | undefined {
    if (!userId) return undefined;

    const userIdString =
      typeof userId === "string" ? userId.trim() : String(userId);

    // Invalid user_id values that Amplitude rejects
    const invalidIds = new Set([
      "",
      "-1",
      "{}",
      "0",
      "00000000-0000-0000-0000-000000000000",
      "anonymous",
      "n/a",
      "na",
      "nil",
      "none",
      "null",
      "undefined",
      "unknown",
    ]);

    // Check if user_id is valid (not in invalid list)
    if (invalidIds.has(userIdString.toLowerCase())) {
      return undefined;
    }

    // Pad user_id if it's less than 5 characters to meet Amplitude's minimum length requirement
    return userIdString.length >= 5 ? userIdString : `user_${userIdString}`;
  }
}

export const amplitudeProvider = new AmplitudeAnalyticsProvider();
