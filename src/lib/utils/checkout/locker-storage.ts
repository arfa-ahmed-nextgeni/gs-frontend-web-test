import { LockerType } from "@/lib/constants/checkout/locker-locations";
import { CHECKOUT_STORAGE_KEYS } from "@/lib/constants/checkout/storage-keys";

export interface StoredLockerInfo {
  lockerAddress: string;
  lockerAddressAr?: string;
  lockerId: string;
  lockerName: string;
  lockerNameAr?: string;
  lockerType: LockerType;
  pointName?: string;
}

const STORAGE_KEY = CHECKOUT_STORAGE_KEYS.LOCKER_INFO;

/**
 * Clear locker information from session storage
 */
export function clearLockerInfo(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear locker info from session storage:", error);
  }
}

/**
 * Retrieve locker information from session storage
 */
export function getLockerInfo(): null | StoredLockerInfo {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as StoredLockerInfo;
  } catch (error) {
    console.error(
      "Failed to retrieve locker info from session storage:",
      error
    );
    return null;
  }
}

/**
 * Store locker information in session storage
 */
export function storeLockerInfo(lockerInfo: StoredLockerInfo): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lockerInfo));
  } catch (error) {
    console.error("Failed to store locker info in session storage:", error);
  }
}
