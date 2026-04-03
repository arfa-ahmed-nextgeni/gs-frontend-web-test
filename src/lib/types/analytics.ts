import type { BootPolicy, BootStrategy } from "@/lib/types/boot";

export type AnalyticsBootPolicy = BootPolicy;
export type AnalyticsBootStrategy = BootStrategy;

export type AnalyticsTool =
  | "amplitude"
  | "googleAnalytics"
  | "googleTagManager"
  | "insider";
