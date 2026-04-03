import {
  APPLE_PAY_MERCHANT_IDENTIFIER_CHECKOUT,
  APPLE_PAY_MERCHANT_IDENTIFIER_PAYFORT,
} from "@/lib/config/client-env";

/**
 * Utility functions for Apple Pay availability checks
 */

/**
 * Checks if the device can make payments with Apple Pay
 */
export function canMakePayments(): boolean {
  if (!isApplePaySessionAvailable()) {
    return false;
  }

  try {
    return ApplePaySession!.canMakePayments();
  } catch {
    return false;
  }
}

/**
 * Checks merchant identifier capabilities
 * Returns a promise that resolves to whether payments can be made with the merchant
 * Note: This function assumes the Apple Pay SDK script has already loaded
 */
export async function checkMerchantCapabilities(
  merchantIdentifier: string
): Promise<boolean> {
  if (!isApplePaySessionAvailable()) {
    return false;
  }

  // Check if applePayCapabilities method is available
  // This should be available once the script has loaded
  if (
    typeof window === "undefined" ||
    !ApplePaySession ||
    typeof ApplePaySession.applePayCapabilities !== "function"
  ) {
    return false;
  }

  try {
    const canMakePaymentsResult = canMakePayments();
    if (!canMakePaymentsResult) {
      return false;
    }

    const capabilities =
      await ApplePaySession.applePayCapabilities(merchantIdentifier);

    switch (capabilities.paymentCredentialStatus) {
      case "paymentCredentialsAvailable":
      case "paymentCredentialStatusUnknown":
      case "paymentCredentialsUnavailable":
        return canMakePaymentsResult;
      case "applePayUnsupported":
      default:
        return false;
    }
  } catch (error) {
    console.error("$$$ checkMerchantCapabilities error", error);
    return false;
  }
}

/**
 * Gets the appropriate Apple Pay merchant identifier based on payment method type
 * @param paymentMethodType - The payment method type code (e.g., "checkoutapplepay", "payfortapplepay")
 * @returns The merchant identifier for the specified payment method
 */
export function getApplePayMerchantIdentifier(
  paymentMethodType: string
): string {
  const normalizedType = paymentMethodType.toLowerCase();
  if (normalizedType === "payfortapplepay") {
    return APPLE_PAY_MERCHANT_IDENTIFIER_PAYFORT;
  }
  // Default to checkout merchant identifier
  return APPLE_PAY_MERCHANT_IDENTIFIER_CHECKOUT;
}

/**
 * Checks if ApplePaySession API is available
 */
export function isApplePaySessionAvailable(): boolean {
  try {
    return typeof window !== "undefined" && !!ApplePaySession;
  } catch {
    return false;
  }
}

/**
 * Checks if the current browser supports Apple Pay
 * Apple Pay ONLY works in Safari or WebKit-based browsers (Chrome/Edge on macOS/iOS)
 * It does NOT work in Chrome/Firefox on Windows/Android
 */
export function isApplePaySupportedBrowser(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();

  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
  const isWebKit =
    /webkit/.test(userAgent) &&
    !/chrome/.test(userAgent) &&
    !/firefox/.test(userAgent);
  const isChromeOnMac =
    /chrome/.test(userAgent) &&
    /macintosh/.test(userAgent) &&
    !/edg/.test(userAgent);
  const isEdgeOnMac = /edg/.test(userAgent) && /macintosh/.test(userAgent);

  return isSafari || isWebKit || isChromeOnMac || isEdgeOnMac;
}

/**
 * Checks if the current context is secure (required for Apple Pay)
 * Apple Pay requires HTTPS or localhost
 */
export function isSecureContext(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.isSecureContext ||
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}
