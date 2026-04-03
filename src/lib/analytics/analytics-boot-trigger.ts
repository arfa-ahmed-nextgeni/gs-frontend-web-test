import "client-only";

import { getAnalyticsBootPolicy } from "@/lib/analytics/utils/analytics-boot-policy";
import { hasBootTriggered, waitForBoot } from "@/lib/boot/boot-trigger";

import type { AnalyticsBootPolicy, AnalyticsTool } from "@/lib/types/analytics";

export function hasAnalyticsBootTriggered(policy: AnalyticsBootPolicy) {
  return hasBootTriggered(policy);
}

export function waitForAnalyticsBoot(
  policy: AnalyticsBootPolicy
): Promise<void> {
  return waitForBoot(policy);
}

export function waitForAnalyticsToolBoot(tool: AnalyticsTool): Promise<void> {
  return waitForAnalyticsBoot(getAnalyticsBootPolicy(tool));
}
