import type { AnalyticsTool } from "@/lib/types/analytics";

// Main analytics cookie-consent config.
// Edit this file when you want to change which tools require consent.
export const ANALYTICS_COOKIE_CONSENT_CONFIG = {
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
} as const satisfies Record<
  AnalyticsTool,
  {
    requiresCookieConsent: boolean;
  }
>;
