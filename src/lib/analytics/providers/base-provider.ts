import type { AnalyticsTool } from "@/lib/analytics/analytics-tool";

/**
 * Base interface for analytics providers
 * Each analytics tool (Amplitude, GA4, Plausible, etc.) must implement this interface
 */
export interface AnalyticsProvider {
  /**
   * Identify a user
   * @param userId - Unique user identifier
   * @param traits - Optional user traits/properties
   */
  identify(userId: string, traits?: Record<string, unknown>): void;

  /**
   * Initialize the analytics provider
   * Called once by the manager during app startup
   * Should be idempotent (safe to call multiple times)
   * @param locale - Optional locale to set during initialization
   */
  initialize(locale?: string): Promise<void>;

  /**
   * Check if the provider is ready to track events
   * Should return true only after successful initialization
   */
  isAvailable(): boolean;

  /**
   * Track a page view
   * @param name - Page name or title
   * @param properties - Optional page properties
   */
  page(name: string, properties?: Record<string, unknown>): void;

  /**
   * Reset user properties and user_id (for logout)
   * Clears all user data from the analytics provider
   */
  resetUser(): void;

  /**
   * Stable identifier used for per-tool analytics consent policies
   */
  tool: AnalyticsTool;

  /**
   * Track a custom event
   * @param eventName - Name of the event to track
   * @param properties - Optional event properties/metadata
   */
  track(eventName: string, properties?: Record<string, unknown>): void;
}
