/**
 * Analytics Module
 * Provides a unified interface for tracking analytics across multiple providers
 */

// Re-export the analytics manager singleton
// Re-export individual providers for advanced use cases
import { amplitudeProvider } from "./providers/amplitude-provider";
import { googleTagManagerProvider } from "./providers/google-tag-manager-provider";

export { analyticsManager as analytics } from "./analytics-manager";

export { amplitudeProvider };
export { googleTagManagerProvider };

// Re-export types
export type { AnalyticsProvider } from "./providers/base-provider";

// Re-export the useAnalytics hook from context
export { useAnalytics } from "@/contexts/analytics-context";

/**
 * Set Snap CAPI user data (first/last name) for fn/ln hashing.
 * Raw names are stored in provider classes and never sent in events.
 */
export function setSnapCapiUserData(
  firstName?: string,
  lastName?: string
): void {
  googleTagManagerProvider.setSnapCapiUserData(firstName, lastName);
}
