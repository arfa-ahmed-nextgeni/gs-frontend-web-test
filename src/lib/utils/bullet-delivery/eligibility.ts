import dayjs, { type Dayjs } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import type { Cart } from "@/lib/models/cart";
import type { Store } from "@/lib/models/stores";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Check if bullet delivery cutoff time has passed
 */
export function isBulletCutoffTimePassed(
  bulletConfig: null | Store["bulletDeliveryConfig"] | undefined,
  now: Dayjs | null
): boolean {
  if (!bulletConfig?.cutOffTime || !now) return false;

  const storeTimezone = "Asia/Riyadh";
  const [h = 0, m = 0, s = 0] = bulletConfig.cutOffTime.split(":").map(Number);

  const cutoff = now.tz(storeTimezone).hour(h).minute(m).second(s);
  const nowDate = now.tz(storeTimezone);

  return nowDate.isAfter(cutoff);
}

/**
 * Check if bullet delivery should be visible
 * Combines all eligibility checks:
 * - Store enabled
 * - Cart eligible
 * - City eligible
 * - Cutoff time not passed (optional, for cart page)
 * - Within city time window
 */
export function isBulletDeliveryVisible(
  cart: Cart | null | undefined,
  storeConfig: null | Store | undefined,
  now: Dayjs | null,
  options?: {
    skipCutoffTimeCheck?: boolean; // If true, skip cutOffTime check (for checkout page)
  }
): boolean {
  // Check store enabled
  if (!isBulletEnabledFromStores(storeConfig)) return false;

  // Check cart eligible
  if (!isCartBulletEligible(cart)) return false;

  // Check city eligible
  const city = cart?.shippingAddress?.city;
  if (!isCityEligibleForBullet(city, storeConfig)) return false;

  const bulletConfig = storeConfig?.bulletDeliveryConfig;

  // Check cutoff time not passed (skip for checkout page, use city time window instead)
  if (!options?.skipCutoffTimeCheck) {
    if (isBulletCutoffTimePassed(bulletConfig, now)) return false;
  }

  // Check within city time window
  if (!isWithinCityTimeWindow(city, bulletConfig, now)) return false;

  return true;
}

/**
 * Check if bullet delivery is enabled from store config
 */
export function isBulletEnabledFromStores(
  storeConfig: null | Store | undefined
): boolean {
  return !!storeConfig?.bulletDeliveryConfig;
}

/**
 * Check if cart is eligible for bullet delivery
 * - First checks cart-level isBulletEligible
 * - Then checks if any configurable items have express_delivery_available on configured_variant
 */
export function isCartBulletEligible(cart: Cart | null | undefined): boolean {
  if (!cart) return false;

  // Check cart-level eligibility
  if (!cart.isBulletEligible) {
    return false;
  }

  // Check if any item is not eligible for bullet delivery
  const hasIneligibleConfigurableItem = cart.items.some(
    (item) => !item.bulletDelivery
  );

  if (hasIneligibleConfigurableItem) {
    return false;
  }

  return true;
}

/**
 * Check if city is eligible for bullet delivery
 * Checks if city exists in bullet delivery cities list from store config
 */
export function isCityEligibleForBullet(
  city: null | string | undefined,
  storeConfig: null | Store | undefined
): boolean {
  if (!city || !storeConfig?.bulletDeliveryConfig?.cities) return false;

  return city in storeConfig.bulletDeliveryConfig.cities;
}

/**
 * Check if current time is within bullet delivery time window (between startHour and endHour)
 */
export function isWithinBulletTimeWindow(
  bulletConfig: null | Store["bulletDeliveryConfig"] | undefined,
  now: Dayjs | null
): boolean {
  if (!bulletConfig?.startHour || !bulletConfig?.endHour || !now) return false;

  const storeTimezone = "Asia/Riyadh";
  const [startH = 0, startM = 0, startS = 0] = bulletConfig.startHour
    .split(":")
    .map(Number);
  const [endH = 0, endM = 0, endS = 0] = bulletConfig.endHour
    .split(":")
    .map(Number);

  const start = now
    .tz(storeTimezone)
    .hour(startH)
    .minute(startM)
    .second(startS);
  const end = now.tz(storeTimezone).hour(endH).minute(endM).second(endS);
  const nowDate = now.tz(storeTimezone);

  return nowDate.isAfter(start) && nowDate.isBefore(end);
}

/**
 * Check if current time is within city-specific time window
 * Parses time window from cities config (format: "HH:mm:ss - HH:mm:ss")
 */
export function isWithinCityTimeWindow(
  city: null | string | undefined,
  bulletConfig: null | Store["bulletDeliveryConfig"] | undefined,
  now: Dayjs | null
): boolean {
  if (!city || !bulletConfig?.cities || !now) return false;

  const cityTimeWindow = bulletConfig.cities[city];
  if (!cityTimeWindow) return false;

  // Parse time window format: "HH:mm:ss - HH:mm:ss"
  const [startTimeStr, endTimeStr] = cityTimeWindow
    .split(" - ")
    .map((s) => s.trim());
  if (!startTimeStr || !endTimeStr) return false;

  const storeTimezone = "Asia/Riyadh";
  const [startH = 0, startM = 0, startS = 0] = startTimeStr
    .split(":")
    .map(Number);
  const [endH = 0, endM = 0, endS = 0] = endTimeStr.split(":").map(Number);

  const start = now
    .tz(storeTimezone)
    .hour(startH)
    .minute(startM)
    .second(startS);
  const end = now.tz(storeTimezone).hour(endH).minute(endM).second(endS);
  const nowDate = now.tz(storeTimezone);

  return nowDate.isAfter(start) && nowDate.isBefore(end);
}
