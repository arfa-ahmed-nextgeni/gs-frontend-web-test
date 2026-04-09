export const CheckoutError = {
  InvalidCart: "invalid-cart",
} as const;

export type CheckoutErrorType =
  (typeof CheckoutError)[keyof typeof CheckoutError];
