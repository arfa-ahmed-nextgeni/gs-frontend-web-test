import {
  isCartDrawerPath,
  isCustomerServicePath,
  isNotifyMePath,
} from "@/lib/utils/routes";

/**
 * Path matchers for parallel-route overlays (drawers/dialogs).
 * When the current pathname matches one of these, layout (header, footer, nav)
 * uses the previous pathname so the underlying route's layout is preserved.
 *
 * To add a new parallel-route overlay:
 * 1. Add a path matcher in @/lib/utils/routes (e.g. isMyOverlayPath).
 * 2. Add it to this array.
 */
const OVERLAY_PATH_MATCHERS: Array<(pathname: string) => boolean> = [
  isCartDrawerPath,
  isNotifyMePath,
  isCustomerServicePath,
];

/**
 * Returns the pathname that layout (header, footer, nav) should use.
 * When the current path is an overlay route, returns previousPathname so
 * the underlying route's layout is shown; otherwise returns pathname.
 */
export function getEffectivePathname(
  pathname: string,
  previousPathname: string
): string {
  const isOverlay =
    OVERLAY_PATH_MATCHERS.some((match) => match(pathname)) && previousPathname;
  return isOverlay ? previousPathname : pathname;
}

/**
 * Returns whether the current pathname is any overlay route.
 */
export function isOverlayRoute(pathname: string): boolean {
  return OVERLAY_PATH_MATCHERS.some((match) => match(pathname));
}
