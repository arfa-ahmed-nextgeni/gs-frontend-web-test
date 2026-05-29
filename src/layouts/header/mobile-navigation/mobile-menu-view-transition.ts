import { ROUTES } from "@/lib/constants/routes";
import { isMenuPath } from "@/lib/utils/routes";
import {
  getSessionStorage,
  removeSessionStorage,
  setSessionStorage,
} from "@/lib/utils/session-storage";

export const MOBILE_MENU_OPEN_HEADER_TRANSITION_TYPE =
  "mobile-menu-open-header";
export const MOBILE_MENU_CLOSE_HEADER_TRANSITION_TYPE =
  "mobile-menu-close-header";
export const MOBILE_MENU_OPEN_BOTTOM_TRANSITION_TYPE =
  "mobile-menu-open-bottom";
export const MOBILE_MENU_CLOSE_BOTTOM_TRANSITION_TYPE =
  "mobile-menu-close-bottom";

export const MOBILE_MENU_OPEN_HEADER_TRANSITION_TYPES = [
  MOBILE_MENU_OPEN_HEADER_TRANSITION_TYPE,
];
export const MOBILE_MENU_OPEN_BOTTOM_TRANSITION_TYPES = [
  MOBILE_MENU_OPEN_BOTTOM_TRANSITION_TYPE,
];

type MobileMenuOrigin = "bottom" | "header";

const MOBILE_MENU_ORIGIN_STORAGE_KEY = "mobile-menu-origin";
const MOBILE_MENU_RETURN_TO_STORAGE_KEY = "mobile-menu-return-to";

export function clearMobileMenuOpenState() {
  removeSessionStorage(MOBILE_MENU_ORIGIN_STORAGE_KEY);
  removeSessionStorage(MOBILE_MENU_RETURN_TO_STORAGE_KEY);
}

export function getMobileMenuViewTransitionProps() {
  return {
    default: "none",
    enter: {
      default: "none",
      [MOBILE_MENU_OPEN_BOTTOM_TRANSITION_TYPE]: "mobile-menu-open-from-bottom",
      [MOBILE_MENU_OPEN_HEADER_TRANSITION_TYPE]: "mobile-menu-open-from-header",
    },
    exit: {
      default: "none",
      [MOBILE_MENU_CLOSE_BOTTOM_TRANSITION_TYPE]: "mobile-menu-close-to-bottom",
      [MOBILE_MENU_CLOSE_HEADER_TRANSITION_TYPE]: "mobile-menu-close-to-header",
    },
  } as const;
}

export function readMobileMenuCloseState() {
  const origin = getStoredMobileMenuOrigin();
  const returnTo = getStoredMobileMenuReturnTo();

  return {
    hasBackNavigation: !!returnTo && hasBrowserBackNavigation(),
    returnTo: returnTo || ROUTES.HOME,
    transitionType:
      origin === "bottom"
        ? MOBILE_MENU_CLOSE_BOTTOM_TRANSITION_TYPE
        : MOBILE_MENU_CLOSE_HEADER_TRANSITION_TYPE,
  };
}

export function shouldSkipMobileMenuViewTransition() {
  if (typeof document === "undefined") {
    return true;
  }

  return document.documentElement.dir === "rtl";
}

export function storeMobileMenuOpenState(
  origin: MobileMenuOrigin,
  pathname: string
) {
  setSessionStorage(MOBILE_MENU_ORIGIN_STORAGE_KEY, origin);
  setSessionStorage(
    MOBILE_MENU_RETURN_TO_STORAGE_KEY,
    getCurrentReturnToPath(pathname)
  );
}

function getCurrentReturnToPath(pathname: string) {
  if (typeof window === "undefined") {
    return pathname;
  }

  return `${pathname}${window.location.search}${window.location.hash}`;
}

function getPathnameFromReturnTo(returnTo: string) {
  return returnTo.split(/[?#]/)[0] || ROUTES.HOME;
}

function getStoredMobileMenuOrigin(): MobileMenuOrigin {
  const origin = getSessionStorage(MOBILE_MENU_ORIGIN_STORAGE_KEY);

  return origin === "bottom" ? "bottom" : "header";
}

function getStoredMobileMenuReturnTo() {
  const returnTo = getSessionStorage(MOBILE_MENU_RETURN_TO_STORAGE_KEY);

  if (!isValidReturnToPath(returnTo)) {
    return null;
  }

  return returnTo;
}

function hasBrowserBackNavigation() {
  return typeof window !== "undefined" && window.history.length > 1;
}

function isValidReturnToPath(returnTo: null | string): returnTo is string {
  return (
    typeof returnTo === "string" &&
    returnTo.startsWith("/") &&
    !isMenuPath(getPathnameFromReturnTo(returnTo))
  );
}
