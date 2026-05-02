import UaeFlag from "@/assets/flags/ae-flag.svg";
import KuwaitFlag from "@/assets/flags/kw-flag.svg";
import OmanFlag from "@/assets/flags/om-flag.svg";
import SaudiFlag from "@/assets/flags/sa-flag.svg";
import { LOCALE_TO_STORE, StoreCode } from "@/lib/constants/i18n";

import type { Locale } from "@/lib/constants/i18n";
import type { Store } from "@/lib/models/stores";

// Country code mapping for different stores
export const STORE_TO_COUNTRY_CODE: Record<StoreCode, string> = {
  [StoreCode.ar_ae]: "+971",
  [StoreCode.ar_bh]: "+973",
  [StoreCode.ar_boulevard]: "+966",
  [StoreCode.ar_global]: "+1",
  [StoreCode.ar_iq]: "+964",
  [StoreCode.ar_kw]: "+965",
  [StoreCode.ar_om]: "+968",
  [StoreCode.ar_sa]: "+966",
  [StoreCode.en_ae]: "+971",
  [StoreCode.en_bh]: "+973",
  [StoreCode.en_boulevard]: "+966",
  [StoreCode.en_global]: "+1",
  [StoreCode.en_iq]: "+964",
  [StoreCode.en_kw]: "+965",
  [StoreCode.en_om]: "+968",
  [StoreCode.en_sa]: "+966",
};

// Country flag mapping
export const COUNTRY_CODE_TO_FLAG: Record<string, any> = {
  "+1": "🌍", // USA (keep emoji for now)
  "+965": KuwaitFlag,
  "+966": SaudiFlag,
  "+968": OmanFlag,
  "+971": UaeFlag,
};

// Get country flag for a country code
export function getCountryFlag(countryCode: string): any {
  return COUNTRY_CODE_TO_FLAG[countryCode] || "🌍";
}

// Get default country code for a store
export function getDefaultCountryCode(storeCode: StoreCode): string {
  return STORE_TO_COUNTRY_CODE[storeCode] || "+966";
}

// Phone number length mapping (excluding country code)
export const COUNTRY_CODE_TO_PHONE_LENGTH: Record<string, number> = {
  "+1": 15, // Global/USA - max length, will use range validation
  "+964": 10, // Iraq
  "+965": 8, // Kuwait
  "+966": 9, // Saudi Arabia
  "+968": 8, // Oman
  "+971": 9, // UAE
};

// Global store phone validation range
export const GLOBAL_PHONE_MIN_LENGTH = 8;
export const GLOBAL_PHONE_MAX_LENGTH = 15;

// Get maximum phone number length for a country code
export function getMaxPhoneNumberLength(
  countryCode: string,
  storeCode?: StoreCode
): number {
  if (storeCode && isGlobalStore(storeCode)) {
    return GLOBAL_PHONE_MAX_LENGTH;
  }
  return getPhoneNumberLength(countryCode);
}

// Get minimum phone number length for a country code
export function getMinPhoneNumberLength(
  countryCode: string,
  storeCode?: StoreCode
): number {
  if (storeCode && isGlobalStore(storeCode)) {
    return GLOBAL_PHONE_MIN_LENGTH;
  }
  return getPhoneNumberLength(countryCode);
}

// Get required phone number length for a country code
export function getPhoneNumberLength(countryCode: string): number {
  return COUNTRY_CODE_TO_PHONE_LENGTH[countryCode] || 9; // Default to 9
}

export function getStoreCode(locale: Locale) {
  return LOCALE_TO_STORE[locale];
}

// Check if store is Global store
export function isGlobalStore(storeCode: StoreCode): boolean {
  return storeCode === StoreCode.ar_global || storeCode === StoreCode.en_global;
}

// Check if phone number is valid for the given country
export function isValidPhoneNumber(
  phoneNumber: string,
  countryCode: string,
  storeCode?: StoreCode,
  strictSaudiValidation: boolean = false
): boolean {
  if (storeCode && isGlobalStore(storeCode)) {
    // Global store: flexible validation (8-15 digits) for any country code
    return (
      phoneNumber.length >= GLOBAL_PHONE_MIN_LENGTH &&
      phoneNumber.length <= GLOBAL_PHONE_MAX_LENGTH
    );
  }
  // Other countries: exact length validation
  const requiredLength = getPhoneNumberLength(countryCode);
  if (strictSaudiValidation) {
    return phoneNumber.startsWith("5") && phoneNumber.length === requiredLength;
  }
  return phoneNumber.length === requiredLength;
}

// Available country codes for selection
export const AVAILABLE_COUNTRY_CODES = [
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "+964", flag: "🇮🇶", name: "Iraq" },
  { code: "+1", flag: "🌍", name: "Global" },
];

/**
 * Get catalog codes from Store object
 * Falls back to defaults if Store is not available
 */
export function getCatalogCodes(store?: null | Store) {
  if (store) {
    return {
      storeCode: store.storeCode,
      websiteCode: store.websiteCode,
    };
  }

  // Fallback to default values
  return {
    storeCode: "main_website_store",
    websiteCode: "sa",
  };
}
