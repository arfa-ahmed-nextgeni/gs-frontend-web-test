"use client";

import { useResponsiveBreakpoint } from "@/hooks/use-responsive-breakpoint";

import type { BreakpointKey } from "@/lib/types/ui-types";

const BREAKPOINTS_ORDER: BreakpointKey[] = ["sm", "md", "lg", "xl", "2xl"];

export function useResponsiveValue<T>(
  values: Partial<Record<BreakpointKey, T>>,
  defaultValue: T
): T {
  const currentBreakpoint = useResponsiveBreakpoint();

  let value = defaultValue;

  for (let i = BREAKPOINTS_ORDER.indexOf(currentBreakpoint); i >= 0; i--) {
    const bp = BREAKPOINTS_ORDER[i];
    if (values[bp] !== undefined) {
      value = values[bp];
      break;
    }
  }

  return value;
}
