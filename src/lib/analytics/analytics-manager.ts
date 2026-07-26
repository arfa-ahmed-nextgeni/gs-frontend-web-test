import "client-only";

import { bannerTrackingManager } from "@/lib/analytics/banner-tracking-manager";
import { resolveAnalyticsProviderEventName } from "@/lib/analytics/config/analytics-provider-event-config";
import { amplitudeProvider } from "@/lib/analytics/providers/amplitude-provider";
import { googleTagManagerProvider } from "@/lib/analytics/providers/google-tag-manager-provider";
import { insiderProvider } from "@/lib/analytics/providers/insider-provider";
import {
  generateCdid,
  SNAP_CAPI_CDID_KEY,
  SNAP_CAPI_EVENTS,
} from "@/lib/analytics/utils/snap-capi-params";

import type { UserProperties } from "@/lib/analytics/models/event-models";
import type { AnalyticsProvider } from "@/lib/analytics/providers/base-provider";
import type { AnalyticsTool } from "@/lib/types/analytics";

/**
 * Events that reset the banner click sequence
 * Banner tracking will be reset only when these specific events are tracked
 * All other events will preserve the banner tracking information
 */
const EVENTS_THAT_RESET_BANNER_TRACKING = [
  "search_recent",
  "search_freetext",
  "search_suggestion",
  "menu_click",
  "desktop_navigation",
  "home",
] as const;

/**
 * Options for tracking events
 */
export interface TrackOptions {
  /**
   * If provided, only send this event to the listed tools.
   * Use when calling track() alongside trackEcommerce() to avoid sending
   * the flat event to GTM twice (since trackEcommerce() already handles GTM).
   */
  onlyTools?: AnalyticsTool[];
  /**
   * Event properties to include
   */
  properties?: Record<string, unknown>;
  /**
   * Optional config lookup key when one trigger needs provider-specific routing
   * without changing other triggers that emit the same canonical event.
   */
  routingKey?: string;
  /**
   * If true, skip including user properties in this event
   */
  skipUserProperties?: boolean;
}

/**
 * Queued event types
 */
type QueuedEvent =
  | {
      additionalFields?: Record<string, unknown>;
      ecommerce: Record<string, unknown>;
      eventName: string;
      type: "ecommerce";
    }
  | {
      eventName: string;
      optionsOrProperties?: TrackOptions;
      type: "track";
    }
  | {
      name: string;
      properties?: Record<string, unknown>;
      type: "page";
    }
  | {
      traits?: Record<string, unknown>;
      type: "identify";
      userId: string;
    };

/**
 * Analytics Manager
 * Coordinates all analytics providers and routes events to them
 */
class AnalyticsManager {
  private enabledTools = new Set<AnalyticsTool>();
  private eventQueue: QueuedEvent[] = [];
  private initGeneration = 0;
  private initializedGeneration = 0;
  private initPromise: null | Promise<void> = null;
  private initPromiseGeneration = 0;
  private locale: null | string = null;
  private providers: AnalyticsProvider[];
  private requestInitialization: (() => void) | null = null;
  private userProperties: null | Partial<UserProperties> = null;

  constructor(providers: AnalyticsProvider[]) {
    this.providers = providers;
  }

  /**
   * Add a new provider at runtime
   */
  addProvider(provider: AnalyticsProvider): void {
    this.providers.push(provider);
    // Initialize the new provider if manager is already initialized
    if (
      this.enabledTools.has(provider.tool) &&
      this.initializedGeneration === this.initGeneration
    ) {
      provider.initialize().catch((error) => {
        console.error("Failed to initialize new analytics provider:", error);
      });
    }
  }

  /**
   * Get the current locale
   */
  getLocale(): null | string {
    return this.locale;
  }

  /**
   * Identify a user across all available providers
   * Queues the event if analytics is not yet initialized
   */
  identify(userId: string, traits?: Record<string, unknown>): void {
    if (this.enabledTools.size === 0) {
      return;
    }

    if (!this.isReadyForTracking()) {
      this.requestInitialization?.();
      this.eventQueue.push({ traits, type: "identify", userId });
      return;
    }

    this.getEnabledProviders().forEach((provider) => {
      if (provider.isAvailable()) {
        try {
          provider.identify(userId, traits);
        } catch (error) {
          // Silently fail - analytics shouldn't break the app
          console.error("Analytics identify error:", error);
        }
      }
    });
  }

  /**
   * Initialize all analytics providers
   * Safe to call multiple times (idempotent)
   * @param locale - Optional locale to set during initialization
   */
  async initialize(locale?: string): Promise<void> {
    if (locale) {
      this.locale = locale;
    }

    if (this.enabledTools.size === 0) {
      this.initializedGeneration = this.initGeneration;
      return;
    }

    if (
      this.initPromise &&
      this.initPromiseGeneration === this.initGeneration
    ) {
      return this.initPromise;
    }

    const currentGeneration = this.initGeneration;
    const enabledProviders = this.getEnabledProviders();

    this.initPromiseGeneration = currentGeneration;
    this.initPromise = (async () => {
      try {
        // Initialize all providers in parallel, passing locale to each
        await Promise.all(
          enabledProviders.map(async (provider) => {
            try {
              await provider.initialize(locale);
            } catch (error) {
              // Log but don't fail - one provider failure shouldn't break others
              console.error("Failed to initialize analytics provider:", error);
            }
          })
        );

        if (this.initGeneration !== currentGeneration) {
          return;
        }

        this.initializedGeneration = currentGeneration;

        // Flush queued events after initialization
        this.flushEventQueue();
      } catch (error) {
        console.error("Failed to initialize analytics manager:", error);
      } finally {
        if (this.initPromiseGeneration === currentGeneration) {
          this.initPromise = null;
        }
      }
    })();

    return this.initPromise;
  }

  isToolEnabled(tool: AnalyticsTool): boolean {
    return this.enabledTools.has(tool);
  }

  /**
   * Track a page view across all available providers
   * Queues the event if analytics is not yet initialized
   */
  page(name: string, properties?: Record<string, unknown>): void {
    if (this.enabledTools.size === 0) {
      return;
    }

    if (!this.isReadyForTracking()) {
      this.requestInitialization?.();
      this.eventQueue.push({ name, properties, type: "page" });
      return;
    }

    this.getEnabledProviders().forEach((provider) => {
      if (provider.isAvailable()) {
        try {
          provider.page(name, properties);
        } catch (error) {
          // Silently fail - analytics shouldn't break the app
          console.error("Analytics page error:", error);
        }
      }
    });
  }

  /**
   * Reset user properties and user_id across all available providers
   * Call this on logout or when user becomes unauthorized
   */
  resetUser(): void {
    // Clear user properties
    this.userProperties = null;

    this.providers.forEach((provider) => {
      if (provider.isAvailable()) {
        try {
          provider.resetUser();
        } catch (error) {
          // Silently fail - analytics shouldn't break the app
          console.error("Analytics resetUser error:", error);
        }
      }
    });
  }

  setEnabledTools(enabledTools: AnalyticsTool[]): void {
    if (areAnalyticsToolSetsEqual(this.enabledTools, enabledTools)) {
      return;
    }

    this.enabledTools = new Set(enabledTools);
    this.initGeneration += 1;
    this.initPromise = null;
    this.initPromiseGeneration = 0;

    if (this.enabledTools.size === 0) {
      this.eventQueue = [];
      this.initializedGeneration = this.initGeneration;
    }
  }

  /**
   * Set the current locale
   * Should be called from AnalyticsProvider when locale changes
   */
  setLocale(locale: string): void {
    this.locale = locale;
    // Update locale in all providers only if they're already initialized
    if (this.initializedGeneration === this.initGeneration) {
      this.setLocaleOnProviders(locale);
    }
  }

  setRequestInitialization(requestInitialization: (() => void) | null): void {
    this.requestInitialization = requestInitialization;
  }

  setUserProperties(userProperties: null | Partial<UserProperties>): void {
    this.userProperties = userProperties;

    if (!userProperties) return;

    this.providers.forEach((provider) => {
      if (
        provider.setUserProperties &&
        typeof provider.setUserProperties === "function"
      ) {
        try {
          provider.setUserProperties(userProperties);
        } catch (error) {
          console.error("Analytics setUserProperties error:", error);
        }
      }
    });
  }

  /**
   * Track a custom event across all available providers.
   * Queues the event if analytics is not yet initialized.
   */
  track(eventName: string, properties?: Record<string, unknown>): void {
    this.trackWithOptions(eventName, { properties });
  }

  /**
   * Push a GA4-style ecommerce event.
   * Only calls providers that implement trackEcommerce (currently GTM).
   * Other providers (Amplitude, Insider) are skipped — use track() alongside
   * this when you want those providers to also receive the event.
   */
  trackEcommerce(
    eventName: string,
    ecommerce: Record<string, unknown>,
    additionalFields?: Record<string, unknown>
  ): void {
    if (this.enabledTools.size === 0) return;

    if (!this.isReadyForTracking()) {
      this.requestInitialization?.();
      this.eventQueue.push({
        additionalFields,
        ecommerce,
        eventName,
        type: "ecommerce",
      });
      return;
    }

    this.getEnabledProviders().forEach((provider) => {
      if (
        provider.isAvailable() &&
        typeof provider.trackEcommerce === "function"
      ) {
        try {
          provider.trackEcommerce(eventName, ecommerce, additionalFields);
        } catch (error) {
          console.error("Analytics trackEcommerce error:", error);
        }
      }
    });
  }

  /**
   * Track a custom event with full options (tool targeting, user-property skipping).
   * Use when you need onlyTools or skipUserProperties; otherwise prefer track().
   * Queues the event if analytics is not yet initialized.
   */
  trackWithOptions(eventName: string, options: TrackOptions): void {
    if (this.enabledTools.size === 0) {
      return;
    }

    // Queue event if enabled providers are not initialized yet
    if (!this.isReadyForTracking()) {
      this.requestInitialization?.();
      this.eventQueue.push({
        eventName,
        optionsOrProperties: options,
        type: "track",
      });
      return;
    }

    // Reset banner tracking only for specific events
    if (
      EVENTS_THAT_RESET_BANNER_TRACKING.includes(
        eventName as (typeof EVENTS_THAT_RESET_BANNER_TRACKING)[number]
      )
    ) {
      bannerTrackingManager.resetLastClickedBanner();
    }

    const {
      onlyTools,
      properties,
      routingKey,
      skipUserProperties = false,
    } = options;

    // Merge user properties with event properties unless skipUserProperties is true
    // Event properties take precedence over user properties if there are conflicts
    let mergedProperties: Record<string, unknown> = skipUserProperties
      ? (properties ?? {})
      : {
          ...this.userProperties,
          ...properties,
        };

    // Generate cdid once per event so GA4 and GTM receive the same value (per Snap CAPI spec)
    if ((SNAP_CAPI_EVENTS as readonly string[]).includes(eventName)) {
      mergedProperties = {
        ...mergedProperties,
        [SNAP_CAPI_CDID_KEY]: generateCdid(),
      };
    }

    const providers = onlyTools
      ? this.getEnabledProviders().filter((p) => onlyTools.includes(p.tool))
      : this.getEnabledProviders();

    providers.forEach((provider) => {
      if (provider.isAvailable()) {
        try {
          const providerEventName = resolveAnalyticsProviderEventName(
            provider.tool,
            eventName,
            routingKey
          );

          if (!providerEventName) return;

          provider.track(providerEventName, mergedProperties, {
            canonicalEventName: eventName,
          });
        } catch (error) {
          // Silently fail - analytics shouldn't break the app
          console.error("Analytics track error:", error);
        }
      }
    });
  }

  /**
   * Flush queued events after initialization
   * Processes all events that were queued before analytics was ready
   */
  private flushEventQueue(): void {
    if (this.eventQueue.length === 0) return;

    // Process all queued events
    const eventsToProcess = [...this.eventQueue];
    this.eventQueue = []; // Clear queue

    eventsToProcess.forEach((event) => {
      try {
        switch (event.type) {
          case "ecommerce":
            this.trackEcommerce(
              event.eventName,
              event.ecommerce,
              event.additionalFields
            );
            break;
          case "identify":
            this.identify(event.userId, event.traits);
            break;
          case "page":
            this.page(event.name, event.properties);
            break;
          case "track":
            this.trackWithOptions(
              event.eventName,
              event.optionsOrProperties ?? {}
            );
            break;
        }
      } catch (error) {
        // Silently fail - analytics shouldn't break the app
        console.error("Error processing queued analytics event:", error);
      }
    });
  }

  private getEnabledProviders(): AnalyticsProvider[] {
    return this.providers.filter((provider) =>
      this.enabledTools.has(provider.tool)
    );
  }

  private isReadyForTracking(): boolean {
    return (
      this.enabledTools.size > 0 &&
      this.initializedGeneration === this.initGeneration
    );
  }

  /**
   * Set locale on all providers
   * Internal helper method to update locale on providers
   */
  private setLocaleOnProviders(locale: string): void {
    this.getEnabledProviders().forEach((provider) => {
      if (provider.isAvailable() && "setLocale" in provider) {
        try {
          (provider as any).setLocale(locale);
        } catch (error) {
          console.error("Analytics setLocale error:", error);
        }
      }
    });
  }
}

// Create and export singleton instance with all providers
export const analyticsManager = new AnalyticsManager([
  amplitudeProvider,
  googleTagManagerProvider,
  insiderProvider,
]);

function areAnalyticsToolSetsEqual(
  currentTools: ReadonlySet<AnalyticsTool>,
  nextTools: AnalyticsTool[]
) {
  if (currentTools.size !== nextTools.length) {
    return false;
  }

  return nextTools.every((tool) => currentTools.has(tool));
}
