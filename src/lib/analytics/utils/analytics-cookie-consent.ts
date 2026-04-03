import { ANALYTICS_COOKIE_CONSENT_CONFIG } from "@/lib/analytics/config/analytics-cookie-consent-config";
import { ANALYTICS_MANAGER_TOOLS } from "@/lib/analytics/config/analytics-manager-config";

import type { AnalyticsTool } from "@/lib/types/analytics";
import type { CookieConsentStatus } from "@/lib/types/cookie-consent";

export function getAnalyticsManagerToolsEnabledByCookieConsent(
  cookieConsentStatus: CookieConsentStatus
) {
  return ANALYTICS_MANAGER_TOOLS.filter((tool) =>
    isAnalyticsToolEnabledByCookieConsent(tool, cookieConsentStatus)
  );
}

export function isAnalyticsToolEnabledByCookieConsent(
  tool: AnalyticsTool,
  cookieConsentStatus: CookieConsentStatus
) {
  if (cookieConsentStatus === "disabled") {
    return true;
  }

  if (!ANALYTICS_COOKIE_CONSENT_CONFIG[tool].requiresCookieConsent) {
    return true;
  }

  return cookieConsentStatus === "accepted";
}
