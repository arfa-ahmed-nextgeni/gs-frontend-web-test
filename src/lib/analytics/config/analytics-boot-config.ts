import { ANALYTICS_TOOL } from "@/lib/analytics/constants/analytics-tool";
import {
  IMMEDIATE_BOOT_POLICY,
  INTERACTION_BOOT_POLICY,
} from "@/lib/boot/config/boot-presets";

import type { AnalyticsBootPolicy, AnalyticsTool } from "@/lib/types/analytics";

// Main analytics boot config.
// Edit this file when you want to change how each analytics tool initializes.

// Change each tool's boot behavior here.

export const ANALYTICS_BOOT_CONFIG = {
  // First-party product analytics can start immediately.
  [ANALYTICS_TOOL.AMPLITUDE]: IMMEDIATE_BOOT_POLICY,

  // Google tags stay deferred to protect TBT.
  [ANALYTICS_TOOL.GOOGLE_ANALYTICS]: INTERACTION_BOOT_POLICY,
  [ANALYTICS_TOOL.GOOGLE_TAG_MANAGER]: INTERACTION_BOOT_POLICY,

  // Insider is also deferred because its script is relatively heavy.
  [ANALYTICS_TOOL.INSIDER]: INTERACTION_BOOT_POLICY,
} as const satisfies Record<AnalyticsTool, AnalyticsBootPolicy>;
