import { LockerType } from "@/lib/constants/checkout/locker-locations";
import {
  SHIPPING_CARRIER_CODES,
  SHIPPING_METHOD_CODES,
} from "@/lib/constants/checkout/shipping-methods";

export type ShippingType =
  | "Fodel Click Collect"
  | "Gifting"
  | "Home Delivery"
  | "Redbox Click Collect";

/**
 * Determines shipping type from shipping method string
 * Converts a shipping method string to "Click Collect" or "Home Delivery" format
 * @param shippingMethod - The shipping method string (e.g., from session storage)
 * @returns "Click Collect" or "Home Delivery"
 */
export function getShippingTypeFromMethod(
  shippingMethod: string
): "Click Collect" | "Home Delivery" {
  const shippingMethodLower = shippingMethod.toLowerCase();
  return shippingMethodLower.includes("pickup") ||
    shippingMethodLower.includes("redbox") ||
    shippingMethodLower.includes("fodel")
    ? "Click Collect"
    : "Home Delivery";
}

/**
 * Maps a shipping option ID to its corresponding shipping type for analytics
 * @param selectedOption - The shipping option ID (e.g., "pickup_fodel", "home_delivery", "gift_delivery")
 * @returns The shipping type string for analytics tracking
 */
export function getShippingTypeFromOption(
  selectedOption: string
): ShippingType {
  if (selectedOption === LockerType.Fodel) {
    return "Fodel Click Collect";
  }
  if (selectedOption === LockerType.Redbox) {
    return "Redbox Click Collect";
  }
  if (selectedOption.includes("home")) {
    return "Home Delivery";
  }
  if (selectedOption.includes("gift")) {
    return "Gifting";
  }
  // Default fallback
  return "Home Delivery";
}

/**
 * Checks if the shipping method is bullet delivery
 * @param carrierCode - The carrier code (e.g., "lambdashipping_express")
 * @param methodCode - The method code (e.g., "delivery")
 * @returns true if the shipping method is bullet delivery
 */
export function isBulletDeliveryMethod(
  carrierCode: string,
  methodCode: string
): boolean {
  return (
    carrierCode === SHIPPING_CARRIER_CODES.BULLET_DELIVERY &&
    methodCode === SHIPPING_METHOD_CODES.BULLET_DELIVERY
  );
}

/**
 * Checks if the shipping method is a locker method (Fodel or Redbox)
 * @param carrierCode - The carrier code (e.g., "lambdashipping_fodellocker")
 * @param methodCode - The method code (e.g., "fodellocker")
 * @returns true if the shipping method is a locker method
 */
export function isLockerMethod(
  carrierCode: string,
  methodCode: string
): boolean {
  return (
    (carrierCode === SHIPPING_CARRIER_CODES.FODEL_LOCKER ||
      carrierCode === SHIPPING_CARRIER_CODES.REDBOX_LOCKER) &&
    (methodCode === SHIPPING_METHOD_CODES.FODEL_LOCKER ||
      methodCode === SHIPPING_METHOD_CODES.REDBOX_LOCKER)
  );
}
