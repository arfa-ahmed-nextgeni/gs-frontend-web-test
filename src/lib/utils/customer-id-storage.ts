import { deleteCookie, getCookie } from "cookies-next/client";

import { CookieName } from "@/lib/constants/cookies";

import type { Customer } from "@/lib/models/customer";

/**
 * Client-side utility to read customer_id from cookie
 * Cookie is set on server-side in otpVerify server action
 * This is needed because get-current-customer API returns id: null,
 * but customer_id is available in otpVerify response
 */

/**
 * Clear customer_id from cookie (client-side only)
 * Note: Server-side logout actions also clear this cookie
 * This utility is available for client-side cleanup when needed
 */
export function clearCustomerId() {
  deleteCookie(CookieName.CUSTOMER_ID);
}

export function clearCustomerUuid() {
  deleteCookie(CookieName.CUSTOMER_UUID);
}

/**
 * Get customer_id from cookie (client-side only)
 * @returns The customer ID or null if not found
 */
export function getCustomerId() {
  const customerId = getCookie(CookieName.CUSTOMER_ID);
  return customerId ? String(customerId) : null;
}

export function getCustomerUuid() {
  const customerUuid = getCookie(CookieName.CUSTOMER_UUID);
  return customerUuid ? String(customerUuid) : null;
}

/**
 * Resolve customer ID from customer object or cookie
 * If customer.id is available, use it; otherwise fallback to cookie
 * @param customer - Customer object with optional id property
 * @returns The resolved customer ID (number) or null
 */
export function resolveCustomerId(
  customer: null | Pick<Customer, "id"> | undefined
): null | number {
  if (customer?.id) {
    return customer.id;
  }

  const customerIdFromCookie = getCustomerId();
  return customerIdFromCookie ? +customerIdFromCookie : null;
}

/**
 * Resolve customer UUID from cookie
 * @returns The resolved customer UUID (string) or null
 */
export function resolveCustomerUuid(): null | string {
  return getCustomerUuid();
}
