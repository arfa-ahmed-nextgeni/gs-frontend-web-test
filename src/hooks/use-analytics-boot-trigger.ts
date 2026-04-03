"use client";

import { useBootTrigger } from "@/hooks/use-boot-trigger";

import type { AnalyticsBootPolicy } from "@/lib/types/analytics";

export function useAnalyticsBootTrigger(
  enabled: boolean,
  policy: AnalyticsBootPolicy
) {
  return useBootTrigger(enabled, policy);
}
