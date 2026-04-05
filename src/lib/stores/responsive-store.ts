import { TAILWIND_BREAKPOINTS } from "@/lib/constants/ui";

import type { BreakpointKey } from "@/lib/types/ui-types";

type Listener = () => void;
type MediaQueries = Record<BreakpointKey, MediaQueryList>;

const DEFAULT_BREAKPOINT: BreakpointKey = "sm";
const listeners = new Set<Listener>();

let currentBreakpoint: BreakpointKey = DEFAULT_BREAKPOINT;
let mediaQueries: MediaQueries | null = null;

export function getResponsiveBreakpoint() {
  return currentBreakpoint;
}

export function getServerResponsiveBreakpoint() {
  return DEFAULT_BREAKPOINT;
}

export function subscribeResponsiveBreakpoint(listener: Listener) {
  listeners.add(listener);

  if (typeof window === "undefined") {
    return () => {
      listeners.delete(listener);
    };
  }

  if (listeners.size === 1) {
    const nextMediaQueries = getMediaQueries();

    Object.values(nextMediaQueries).forEach((mediaQuery) => {
      mediaQuery.addEventListener("change", syncResponsiveBreakpoint);
    });

    syncResponsiveBreakpoint();
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && mediaQueries) {
      Object.values(mediaQueries).forEach((mediaQuery) => {
        mediaQuery.removeEventListener("change", syncResponsiveBreakpoint);
      });
    }
  };
}

export function syncResponsiveBreakpoint() {
  const nextBreakpoint = getClientBreakpoint();

  if (currentBreakpoint === nextBreakpoint) {
    return;
  }

  currentBreakpoint = nextBreakpoint;
  notify();
}

function createMediaQueries(): MediaQueries {
  return {
    "2xl": window.matchMedia(`(min-width: ${TAILWIND_BREAKPOINTS["2xl"]}px)`),
    lg: window.matchMedia(`(min-width: ${TAILWIND_BREAKPOINTS.lg}px)`),
    md: window.matchMedia(`(min-width: ${TAILWIND_BREAKPOINTS.md}px)`),
    sm: window.matchMedia(`(min-width: ${TAILWIND_BREAKPOINTS.sm}px)`),
    xl: window.matchMedia(`(min-width: ${TAILWIND_BREAKPOINTS.xl}px)`),
  };
}

function getClientBreakpoint() {
  if (typeof window === "undefined") {
    return DEFAULT_BREAKPOINT;
  }

  return getCurrentBreakpoint(getMediaQueries());
}

function getCurrentBreakpoint(mediaQueries: MediaQueries): BreakpointKey {
  if (mediaQueries["2xl"].matches) return "2xl";
  if (mediaQueries.xl.matches) return "xl";
  if (mediaQueries.lg.matches) return "lg";
  if (mediaQueries.md.matches) return "md";
  return "sm";
}

function getMediaQueries() {
  if (!mediaQueries) {
    mediaQueries = createMediaQueries();
  }

  return mediaQueries;
}

function notify() {
  listeners.forEach((listener) => {
    listener();
  });
}
