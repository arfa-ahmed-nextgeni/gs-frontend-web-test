import { ANALYTICS_TOOL } from "@/lib/analytics/constants/analytics-tool";

import type { AnalyticsTool } from "@/lib/types/analytics";

// Main analytics manager config.
// Edit this file when you want to change which tools are managed centrally.
export const ANALYTICS_MANAGER_TOOLS = [
  ANALYTICS_TOOL.AMPLITUDE,
  ANALYTICS_TOOL.GOOGLE_TAG_MANAGER,
  ANALYTICS_TOOL.INSIDER,
] satisfies AnalyticsTool[];
