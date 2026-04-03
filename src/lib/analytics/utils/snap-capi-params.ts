import "client-only";

export interface SnapCapiUserData {
  firstName?: string;
  lastName?: string;
}

/** Internal key for shared cdid - GA4 and GTM use same value per event; Amplitude filters it out */
export const SNAP_CAPI_CDID_KEY = "snapCapiCdid";

/**
 * Snapchat CAPI v3 events that require Snap parameters (cdid, fn, ln, ua).
 * These parameters are added only when sending to GA4 and GTM, not Amplitude.
 */
export const SNAP_CAPI_EVENTS = [
  "add_to_cart",
  "add_to_wishlist",
  "login",
  "purchase",
  "search_freetext",
  "signup",
  "view_cart",
  "view_category",
  "view_product",
] as const;

export type SnapCapiEventName = (typeof SNAP_CAPI_EVENTS)[number];

export interface SnapCapiParams {
  cdid: string;
  fn?: string;
  ln?: string;
  ua?: string;
}

/**
 * Build Snap CAPI parameters for the given event (async when fn/ln need hashing).
 * Only returns params for the 9 target events.
 * fn/ln are derived from userData - raw names never sent.
 * cdid should be passed from analytics manager so GA4 and GTM share the same value per event.
 */
export async function buildSnapCapiParams(
  eventName: string,
  userData: SnapCapiUserData,
  cdid?: string
): Promise<null | SnapCapiParams> {
  if (!isSnapCapiEvent(eventName)) {
    return null;
  }

  const params: SnapCapiParams = {
    cdid: cdid ?? generateCdid(),
  };

  const { firstName, lastName } = userData;

  if (firstName) {
    const hashedFn = await normalizeAndHashNameAsync(firstName);
    if (hashedFn) params.fn = hashedFn;
  }

  if (lastName) {
    const hashedLn = await normalizeAndHashNameAsync(lastName);
    if (hashedLn) params.ln = hashedLn;
  }

  const ua = getUserAgent();
  if (ua) params.ua = ua;

  return params;
}

/**
 * Generate deduplication ID (cdid) per Snap CAPI v3 spec.
 * Format: {unix_timestamp}_{random_10_digit_number}
 * Example: 1699458344_6873246512
 */
export function generateCdid(): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = Math.floor(Math.random() * 1e10)
    .toString()
    .padStart(10, "0");
  return `${timestamp}_${random}`;
}

/**
 * Normalize and hash a name (first or last) for Snap CAPI.
 */
export async function normalizeAndHashNameAsync(name: string): Promise<string> {
  const normalized = normalizeName(name);
  return hashNameAsync(normalized);
}

/**
 * Get user agent for web events. Returns empty string if not in browser.
 */
function getUserAgent(): string {
  if (typeof navigator === "undefined") return "";
  return navigator.userAgent;
}

/**
 * Hash a normalized name with SHA-256 per Snap CAPI spec.
 * Uses Web Crypto API (async).
 */
async function hashNameAsync(normalized: string): Promise<string> {
  if (!normalized || typeof crypto === "undefined" || !crypto.subtle) {
    return "";
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isSnapCapiEvent(eventName: string): eventName is SnapCapiEventName {
  return (SNAP_CAPI_EVENTS as readonly string[]).includes(eventName);
}

/**
 * Normalize name for Snap CAPI: lowercase, remove punctuation.
 * Special characters must be encoded using UTF-8.
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim();
}
