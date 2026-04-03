import { TAILWIND_BREAKPOINTS } from "@/lib/constants/ui";

export function isDesktopViewport() {
  return window.matchMedia(`(min-width: ${TAILWIND_BREAKPOINTS.lg}px)`).matches;
}

export function isMobileViewport() {
  return !isDesktopViewport();
}
