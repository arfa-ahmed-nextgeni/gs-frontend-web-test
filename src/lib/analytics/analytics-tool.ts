export const ANALYTICS_TOOL = {
  AMPLITUDE: "amplitude",
  GOOGLE_ANALYTICS: "googleAnalytics",
  GOOGLE_TAG_MANAGER: "googleTagManager",
  INSIDER: "insider",
} as const;

export type AnalyticsTool =
  (typeof ANALYTICS_TOOL)[keyof typeof ANALYTICS_TOOL];
