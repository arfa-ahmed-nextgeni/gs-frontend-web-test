"use client";

import { GoogleAnalytics } from "@next/third-parties/google";

import { useCookieConsent } from "@/contexts/cookie-consent-context";
import { useIdleLoad } from "@/hooks/use-idle-load";
import { isAnalyticsToolEnabledByCookieConsent } from "@/lib/analytics/analytics-cookie-consent-policy";
import { ANALYTICS_TOOL } from "@/lib/analytics/analytics-tool";
import {
  GOOGLE_ANALYTICS_DEBUG_MODE,
  GOOGLE_ANALYTICS_ID,
} from "@/lib/config/client-env";

/**
 * Wraps Next.js GoogleAnalytics with GA ID and debug mode from env.
 * Renders nothing when GOOGLE_ANALYTICS_ID is not set.
 */
export function GoogleAnalyticsWrapper() {
  const { cookieConsentStatus } = useCookieConsent();
  const isGoogleAnalyticsEnabled = isAnalyticsToolEnabledByCookieConsent(
    ANALYTICS_TOOL.GOOGLE_ANALYTICS,
    {
      cookieConsentStatus,
    }
  );
  const shouldLoad = useIdleLoad(isGoogleAnalyticsEnabled);

  if (!GOOGLE_ANALYTICS_ID) {
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
