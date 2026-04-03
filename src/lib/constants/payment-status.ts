export const PaymentStatus = {
  Cancelled: "cancelled",
  Failed: "failed",
} as const;

export type PaymentStatusType =
  (typeof PaymentStatus)[keyof typeof PaymentStatus];
