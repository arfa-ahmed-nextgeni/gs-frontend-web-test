import { ANALYTICS_BOOT_CONFIG } from "@/lib/analytics/config/analytics-boot-config";

import type { AnalyticsTool } from "@/lib/types/analytics";

export function getAnalyticsBootPolicy(tool: AnalyticsTool) {
  return ANALYTICS_BOOT_CONFIG[tool];
}
