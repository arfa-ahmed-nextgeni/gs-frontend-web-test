"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/query-keys";
import {
  checkMerchantCapabilities,
  getApplePayMerchantIdentifier,
  isApplePaySessionAvailable,
  isApplePaySupportedBrowser,
  isSecureContext,
} from "@/lib/utils/checkout/apple-pay";
import { isApplePayPaymentMethod } from "@/lib/utils/payment-method";

/**
 * Hook to check if Apple Pay is available on the current device and browser
 *
 * This hook performs comprehensive checks:
 * - Browser support (Safari/WebKit on macOS/iOS)
 * - Secure context (HTTPS or localhost)
 * - ApplePaySession API availability
 * - Device payment capability
 * - Merchant identifier validation
 *
 * Uses TanStack React Query for state management and automatic revalidation.
 * Revalidates when payment method changes (merchant identifier changes).
 *
 * @param isScriptLoaded - Whether the Apple Pay script has loaded
 * @param selectedPayment - The selected payment method code (e.g., "checkoutapplepay", "payfortapplepay")
 * @param enabled - Whether the check should be enabled (defaults to true when script is loaded)
 * @returns Object with `isAvailable` (boolean) and `isPending` (boolean) state
 *
 * @example
 * ```tsx
 * const { isAvailable, isPending } = useApplePayAvailability(isScriptLoaded, selectedPayment);
 *
 * if (isPending) return <Spinner />;
 * if (!isAvailable) return <UnavailableMessage />;
 * return <ApplePayButton />;
 * ```
 */
export function useApplePayAvailability(
  isScriptLoaded: boolean,
  selectedPayment: string
) {
  // Determine merchant identifier from selected payment method
  const merchantIdentifier = getApplePayMerchantIdentifier(selectedPayment);
  const isApplePayPayment = isApplePayPaymentMethod(selectedPayment);

  const { data: isAvailable = false, isPending } = useQuery({
    enabled: isScriptLoaded && isApplePayPayment,
    queryFn: async () => {
      // Early return if browser doesn't support Apple Pay
      if (!isApplePaySupportedBrowser()) {
        return false;
      }

      // Early return if not in secure context
      if (!isSecureContext()) {
        return false;
      }

      // Early return if ApplePaySession API is not available
      if (!isApplePaySessionAvailable()) {
        return false;
      }

      try {
        // Check merchant capabilities (includes canMakePayments check)
        const available = await checkMerchantCapabilities(merchantIdentifier);
        return available;
      } catch {
        // Silently handle errors - Apple Pay is not available
        return false;
      }
    },
    queryKey: QUERY_KEYS.APPLE_PAY.AVAILABILITY(merchantIdentifier),
  });

  return { isAvailable, isPending };
}
