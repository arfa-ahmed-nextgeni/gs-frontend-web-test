import {
  ANALYTICS_TOOL,
  type AnalyticsTool,
} from "@/lib/analytics/analytics-tool";

import type { CookieConsentStatus } from "@/lib/types/cookie-consent";

export const ANALYTICS_COOKIE_CONSENT_POLICY = {
  amplitude: {
    requiresCookieConsent: true,
  },
  googleAnalytics: {
    requiresCookieConsent: true,
  },
  googleTagManager: {
    requiresCookieConsent: true,
  },
  insider: {
    requiresCookieConsent: true,
  },
} as const;

export type AnalyticsCookieConsentEligibilityArgs = {
  cookieConsentStatus: CookieConsentStatus;
};

export function getAnalyticsManagerToolsEnabledByCookieConsent(
  args: AnalyticsCookieConsentEligibilityArgs
) {
  return ANALYTICS_MANAGER_TOOLS.filter((tool) =>
    isAnalyticsToolEnabledByCookieConsent(tool, args)
  );
}

export function isAnalyticsToolEnabledByCookieConsent(
  tool: AnalyticsTool,
  { cookieConsentStatus }: AnalyticsCookieConsentEligibilityArgs
) {
  if (cookieConsentStatus === "disabled") {
    return true;
  }

  if (!ANALYTICS_COOKIE_CONSENT_POLICY[tool].requiresCookieConsent) {
    return true;
  }

  return cookieConsentStatus === "accepted";
}

export const ANALYTICS_MANAGER_TOOLS = [
  ANALYTICS_TOOL.AMPLITUDE,
  ANALYTICS_TOOL.GOOGLE_TAG_MANAGER,
  ANALYTICS_TOOL.INSIDER,
] satisfies AnalyticsTool[];
