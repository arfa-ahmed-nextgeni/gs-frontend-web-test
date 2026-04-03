"use client";

import { useSyncExternalStore } from "react";

import {
  getResponsiveBreakpoint,
  getServerResponsiveBreakpoint,
  subscribeResponsiveBreakpoint,
} from "@/lib/stores/responsive-store";

export function useResponsiveBreakpoint() {
  return useSyncExternalStore(
    subscribeResponsiveBreakpoint,
    getResponsiveBreakpoint,
    getServerResponsiveBreakpoint
  );
}
