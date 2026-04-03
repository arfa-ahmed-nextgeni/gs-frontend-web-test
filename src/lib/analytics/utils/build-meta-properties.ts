import "client-only";

import Cookies from "js-cookie";

import { COUNTRY_CODE_TO_NAME } from "@/lib/constants/i18n";
import { SessionStorageKey } from "@/lib/constants/session-storage";
import { getLocaleInfo } from "@/lib/utils/locale";
import { getSessionStorage } from "@/lib/utils/session-storage";

/**
 * Language code to language name mapping
 */
const LANGUAGE_CODE_TO_NAME: Record<string, string> = {
  ar: "Arabic",
  en: "English",
};

/**
 * Build meta properties for analytics events
 * These properties are automatically added to every event
 * @param locale - The current locale (e.g., "en-SA", "ar-KW")
 */
export function buildMetaProperties(
  locale: null | string
): Record<string, unknown> {
  const meta: Record<string, unknown> = {};

  if (locale) {
    const { language, region } = getLocaleInfo(locale);

    // Get country name
    const countryName = COUNTRY_CODE_TO_NAME[region] || "Unknown";
    meta["meta.country"] = countryName;

    // Get language name
    const languageName = LANGUAGE_CODE_TO_NAME[language] || language;
    meta["meta.language"] = languageName;
  } else {
    // Fallback values if locale cannot be determined
    meta["meta.country"] = "Unknown";
    meta["meta.language"] = "Unknown";
  }

  // Check if user is logged in
  const isLoggedIn = isUserLoggedIn();
  meta["meta.is_guest"] = !isLoggedIn;

  // Check if user has email
  // is_dummy = true when user has no email
  const hasEmail = hasUserEmail();
  meta["meta.is_dummy"] = !hasEmail;

  return meta;
}

/**
 * Check if user has email
 * Checks sessionStorage for stored customer email, or defaults based on login status
 */
function hasUserEmail(): boolean {
  // If user is not logged in, they don't have email
  if (!isUserLoggedIn()) {
    return true;
  }

  const customerEmail = getSessionStorage(SessionStorageKey.CUSTOMER_EMAIL);
  if (customerEmail !== null) {
    // If email is stored and not empty, user has email
    return customerEmail !== "";
  }

  // For logged-in users without stored email data, we assume they might have email
  // This is a best-effort approach - the actual customer data will determine the real value
  // In production, customer email should be stored in sessionStorage when customer data is fetched
  return true;
}

/**
 * Check if user is logged in by checking for auth_token cookie
 */
function isUserLoggedIn(): boolean {
  if (typeof window === "undefined") return false;

  const authToken = Cookies.get("auth_token");
  return !!authToken;
}
