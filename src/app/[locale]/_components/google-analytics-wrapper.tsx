"use client";

import { GoogleAnalytics } from "@next/third-parties/google";

import { useCookieConsent } from "@/contexts/cookie-consent-context";
import { useAnalyticsBootTrigger } from "@/hooks/use-analytics-boot-trigger";
import { ANALYTICS_TOOL } from "@/lib/analytics/constants/analytics-tool";
import { getAnalyticsBootPolicy } from "@/lib/analytics/utils/analytics-boot-policy";
import { isAnalyticsToolEnabledByCookieConsent } from "@/lib/analytics/utils/analytics-cookie-consent";
import {
  GOOGLE_ANALYTICS_DEBUG_MODE,
  GOOGLE_ANALYTICS_ID,
  GOOGLE_ANALYTICS_WRAPPER_ENABLED,
} from "@/lib/config/client-env";

/**
 * Wraps Next.js GoogleAnalytics with GA ID and debug mode from env.
 * Kept behind a dedicated env flag so GTM can remain the active path by default.
 */
export function GoogleAnalyticsWrapper() {
  const { cookieConsentStatus } = useCookieConsent();
  const isGoogleAnalyticsEnabled = isAnalyticsToolEnabledByCookieConsent(
    ANALYTICS_TOOL.GOOGLE_ANALYTICS,
    cookieConsentStatus
  );
  const shouldLoad = useAnalyticsBootTrigger(
    GOOGLE_ANALYTICS_WRAPPER_ENABLED && isGoogleAnalyticsEnabled,
    getAnalyticsBootPolicy(ANALYTICS_TOOL.GOOGLE_ANALYTICS)
  );

  if (!GOOGLE_ANALYTICS_WRAPPER_ENABLED || !GOOGLE_ANALYTICS_ID) {
    return null;
  }

  if (!isGoogleAnalyticsEnabled || !shouldLoad) {
    return null;
  }

  return (
    <GoogleAnalytics
      debugMode={GOOGLE_ANALYTICS_DEBUG_MODE}
      gaId={GOOGLE_ANALYTICS_ID}
    />
  );
}
