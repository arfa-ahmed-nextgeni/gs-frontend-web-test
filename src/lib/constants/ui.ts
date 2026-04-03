import { BreakpointMap } from "@/lib/types/ui-types";

export const enum ZIndexLevel {
  Dialog = "z-999",
  MobileBottomNavigation = "z-51",
  z0 = "z-0",
  z10 = "z-10",
  z15 = "z-15",
  z20 = "z-20",
  z25 = "z-25",
  z30 = "z-30",
  z35 = "z-35",
  z40 = "z-40",
  z45 = "z-45",
  z5 = "z-5",
  z50 = "z-50",
  z99 = "z-99",
  z9999 = "z-9999",
}

export const TAILWIND_BREAKPOINTS: BreakpointMap = {
  "2xl": 1536,
  lg: 1024,
  md: 768,
  sm: 640,
  xl: 1280,
};

export const DEFAULT_TOAST_DURATION = 3300;
