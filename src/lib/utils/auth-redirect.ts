import { ROUTES } from "@/lib/constants/routes";

/**
 * Clear the stored redirect URL
 */
export function clearRedirectUrl(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("auth_redirect_url");
  }
}

/**
 * Mid-journey onboarding suppression helpers
 */
const SUPPRESS_REGISTRATION_KEY = "suppress_registration";
const SCROLL_POSITION_KEY = "scroll_position";

export function clearSuppressRegistration(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(SUPPRESS_REGISTRATION_KEY);
  }
}

/**
 * Generate login URL with redirect parameter
 */
export function getLoginUrlWithRedirect(redirectUrl?: string): string {
  let currentUrl = redirectUrl;

  if (!currentUrl && typeof window !== "undefined") {
    const pathname = stripLocaleFromPath(window.location.pathname);
    currentUrl = pathname + window.location.search;
  }

  // Don't redirect to login page itself
  if (currentUrl && currentUrl.includes("/customer/login")) {
    return ROUTES.CUSTOMER.LOGIN;
  }

  const encodedRedirect = encodeURIComponent(currentUrl || "");
  return `${ROUTES.CUSTOMER.LOGIN}?redirect=${encodedRedirect}`;
}

/**
 * Get the final redirect URL after login, with fallback to account page
 */
export function getPostLoginRedirectUrl(
  searchParams?: URLSearchParams
): string {
  const redirectUrl = getRedirectUrl(searchParams);

  if (redirectUrl) {
    clearRedirectUrl();
    return redirectUrl;
  }

  // Default fallback
  return ROUTES.CUSTOMER.ACCOUNT;
}

/**
 * Get the redirect URL from URL search params or session storage
 */
export function getRedirectUrl(searchParams?: URLSearchParams): null | string {
  // First check URL search params
  if (searchParams) {
    const redirectParam = searchParams.get("redirect");
    if (redirectParam) {
      return decodeURIComponent(redirectParam);
    }
  }

  // Fallback to session storage
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("auth_redirect_url");
  }

  return null;
}

/**
 * Restore the scroll position after navigation
 */
export function restoreScrollPosition(): void {
  if (typeof window !== "undefined") {
    const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
    if (savedPosition) {
      const position = parseInt(savedPosition, 10);

      // Method 1: Try window.scrollTo
      window.scrollTo({
        behavior: "instant",
        top: position,
      });

      // Method 2: Also try scrollTo as fallback
      window.scrollTo(0, position);

      // Method 3: Set both scrollTop properties
      document.documentElement.scrollTop = position;
      document.body.scrollTop = position;

      sessionStorage.removeItem(SCROLL_POSITION_KEY);
    }
  }
}

/**
 * Save the current scroll position before navigation
 */
export function saveScrollPosition(): void {
  if (typeof window !== "undefined") {
    const scrollPosition = window.scrollY;
    sessionStorage.setItem(SCROLL_POSITION_KEY, scrollPosition.toString());
  }
}

export function setSuppressRegistration(): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SUPPRESS_REGISTRATION_KEY, "1");
  }
}

export function shouldSuppressRegistration(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SUPPRESS_REGISTRATION_KEY) === "1";
}

/**
 * Store the current URL as redirect URL before going to login
 */
export function storeRedirectUrl(): void {
  if (typeof window !== "undefined") {
    const pathname = stripLocaleFromPath(window.location.pathname);
    const currentUrl = pathname + window.location.search;
    // Don't store login page itself as redirect
    if (!currentUrl.includes("/customer/login")) {
      sessionStorage.setItem("auth_redirect_url", currentUrl);
    }
  }
}

/**
 * Strip locale prefix from pathname (e.g., /en/c/fragrances -> /c/fragrances)
 */
function stripLocaleFromPath(pathname: string): string {
  // Match locale pattern: /en/ or /ar/ at the start
  const localePattern = /^\/[a-z]{2}(\/|$)/;
  if (localePattern.test(pathname)) {
    // Remove the locale prefix (e.g., /en/)
    return pathname.replace(/^\/[a-z]{2}/, "") || "/";
  }
  return pathname;
}
