import { usePaymentStatusParam } from "@/hooks/checkout/use-payment-status-param";
import { PaymentStatus } from "@/lib/constants/payment-status";

/**
 * Returns true when user has returned to checkout with payment_status=cancelled or failed.
 * Use to skip auto-trigger analytics events; only use-payment-status-error events should fire.
 */
export function useIsReturningFromPaymentError() {
  const { paymentStatus } = usePaymentStatusParam();
  return (
    paymentStatus === PaymentStatus.Cancelled ||
    paymentStatus === PaymentStatus.Failed
  );
}
