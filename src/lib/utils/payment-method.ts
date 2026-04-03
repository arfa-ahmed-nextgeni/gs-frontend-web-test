/**
 * Utility functions to detect payment method types.
 * These functions centralize payment method detection logic to avoid duplication.
 * Can be used across the application, not just for analytics.
 */

/**
 * Checks if the payment method is Apple Pay
 * @param paymentMethod - The payment method string (case-insensitive)
 * @returns true if the payment method is Apple Pay
 */
export function isApplePayPaymentMethod(paymentMethod: string): boolean {
  const paymentMethodLower = paymentMethod.toLowerCase();
  return (
    paymentMethodLower === "checkoutapplepay" ||
    paymentMethodLower === "payfortapplepay" ||
    paymentMethodLower.includes("applepay") ||
    paymentMethodLower.includes("apple_pay")
  );
}

/**
 * Checks if the payment method is Checkout.com
 * @param paymentMethod - The payment method string (case-insensitive)
 * @returns true if the payment method is Checkout.com
 */
export function isCheckoutComPaymentMethod(paymentMethod: string): boolean {
  const paymentMethodLower = paymentMethod.toLowerCase();
  return (
    paymentMethodLower === "checkoutcom_pay" ||
    paymentMethodLower === "checkoutcom" ||
    paymentMethodLower.includes("checkoutcom") ||
    paymentMethodLower.includes("checkout.com")
  );
}

/**
 * Checks if the payment method is Cash on Delivery (COD)
 * @param paymentMethod - The payment method string (case-insensitive)
 * @returns true if the payment method is COD
 */
export function isCodPaymentMethod(paymentMethod: string): boolean {
  const paymentMethodLower = paymentMethod.toLowerCase();
  return (
    paymentMethodLower === "cod" ||
    paymentMethodLower.includes("cod") ||
    paymentMethodLower.includes("cashondelivery") ||
    paymentMethodLower.includes("cash_on_delivery")
  );
}

/**
 * Checks if the payment method requires a credit card section
 * (Credit card, Mada, Checkout.com, or other card-based payments)
 * @param paymentMethod - The payment method string (case-insensitive)
 * @returns true if the payment method requires a credit card section
 */
export function isCreditCardPaymentMethod(paymentMethod: string): boolean {
  const paymentMethodLower = paymentMethod.toLowerCase();
  return (
    isMadaPaymentMethod(paymentMethod) ||
    isCheckoutComPaymentMethod(paymentMethod) ||
    paymentMethodLower.includes("visa") ||
    paymentMethodLower.includes("mastercard") ||
    paymentMethodLower.includes("creditcard") ||
    paymentMethodLower.includes("credit_card")
  );
}

/**
 * Checks if the payment method is Mada
 * @param paymentMethod - The payment method string (case-insensitive)
 * @returns true if the payment method is Mada
 */
export function isMadaPaymentMethod(paymentMethod: string): boolean {
  const paymentMethodLower = paymentMethod.toLowerCase();
  return paymentMethodLower === "mada" || paymentMethodLower.includes("mada");
}

/**
 * Checks if the payment method is Payfort Apple Pay
 * @param paymentMethod - The payment method string (case-insensitive)
 * @returns true if the payment method is Payfort Apple Pay
 */
export function isPayfortApplePayPaymentMethod(paymentMethod: string): boolean {
  const paymentMethodLower = paymentMethod.toLowerCase();
  return (
    paymentMethodLower === "payfortapplepay" ||
    (paymentMethodLower.includes("payfort") &&
      (paymentMethodLower.includes("applepay") ||
        paymentMethodLower.includes("apple_pay")))
  );
}

/**
 * Checks if the payment method is Payfort
 * @param paymentMethod - The payment method string (case-insensitive)
 * @returns true if the payment method is Payfort
 */
export function isPayfortPaymentMethod(paymentMethod: string): boolean {
  const paymentMethodLower = paymentMethod.toLowerCase();
  return (
    paymentMethodLower.includes("payfort") || paymentMethodLower === "payfortcc"
  );
}

/**
 * Checks if the payment method is Tabby
 * @param paymentMethod - The payment method string (case-insensitive)
 * @returns true if the payment method is Tabby
 */
export function isTabbyPaymentMethod(paymentMethod: string): boolean {
  const paymentMethodLower = paymentMethod.toLowerCase();
  return (
    paymentMethodLower.includes("tabby") ||
    paymentMethodLower === "tabby_installments"
  );
}

/**
 * Checks if the payment method is Tamara
 * @param paymentMethod - The payment method string (case-insensitive)
 * @returns true if the payment method is Tamara
 */
export function isTamaraPaymentMethod(paymentMethod: string): boolean {
  const paymentMethodLower = paymentMethod.toLowerCase();
  return (
    paymentMethodLower.includes("tamara") ||
    paymentMethodLower === "pay_by_instalments" ||
    paymentMethodLower.includes("paybyinstalments")
  );
}

/**
 * Determines if a payment method requires the card payment section
 * @param paymentMethod - The payment method code (case-insensitive)
 * @returns true if the payment method requires credit card input
 */
export function requiresCardPaymentSection(paymentMethod: string): boolean {
  const lowerCode = paymentMethod.toLowerCase();
  return (
    (lowerCode === "checkoutcom" ||
      lowerCode === "checkoutcom_pay" ||
      lowerCode.includes("payfort") ||
      lowerCode.includes("creditcard") ||
      lowerCode.includes("mada") ||
      lowerCode.includes("visa") ||
      lowerCode.includes("mastercard")) &&
    !isApplePayPaymentMethod(lowerCode)
  );
}
