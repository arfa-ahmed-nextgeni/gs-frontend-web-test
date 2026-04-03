"use client";

import { GoogleTagManager } from "@next/third-parties/google";

import { useCookieConsent } from "@/contexts/cookie-consent-context";
import { useAnalyticsBootTrigger } from "@/hooks/use-analytics-boot-trigger";
import { ANALYTICS_TOOL } from "@/lib/analytics/constants/analytics-tool";
import { getAnalyticsBootPolicy } from "@/lib/analytics/utils/analytics-boot-policy";
import { isAnalyticsToolEnabledByCookieConsent } from "@/lib/analytics/utils/analytics-cookie-consent";
import { GOOGLE_TAG_MANAGER_ID } from "@/lib/config/client-env";

/**
 * Wraps Next.js Google Tag Manager.
 * Renders nothing when GOOGLE_TAG_MANAGER_ID is not set.
 * Use sendGTMEvent from @next/third-parties/google to send events.
 */
export function GoogleTagManagerWrapper() {
  const { cookieConsentStatus } = useCookieConsent();
  const isGoogleTagManagerEnabled = isAnalyticsToolEnabledByCookieConsent(
    ANALYTICS_TOOL.GOOGLE_TAG_MANAGER,
    cookieConsentStatus
  );
  const shouldLoad = useAnalyticsBootTrigger(
    isGoogleTagManagerEnabled,
    getAnalyticsBootPolicy(ANALYTICS_TOOL.GOOGLE_TAG_MANAGER)
  );

  if (!GOOGLE_TAG_MANAGER_ID) {
    return null;
  }

  if (!isGoogleTagManagerEnabled || !shouldLoad) {
    return null;
  }

  return <GoogleTagManager gtmId={GOOGLE_TAG_MANAGER_ID} />;
}
