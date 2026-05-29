import { TAILWIND_BREAKPOINTS } from "@/lib/constants/ui";

export const DESKTOP_VIEWPORT_MEDIA_QUERY = `(min-width: ${TAILWIND_BREAKPOINTS.lg}px)`;

export function isDesktopViewport() {
  return window.matchMedia(DESKTOP_VIEWPORT_MEDIA_QUERY).matches;
}

export function isMobileViewport() {
  return !isDesktopViewport();
}
