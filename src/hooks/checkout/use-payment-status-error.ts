import { useEffect } from "react";

import { useTranslations } from "next-intl";

import { toast } from "@/components/ui/sonner";
import { useAnalytics } from "@/contexts/analytics-context";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { usePaymentStatusParam } from "@/hooks/checkout/use-payment-status-param";
import {
  trackCcPaymentCancel,
  trackPurchasePaymentError,
  trackTabbyClose,
  trackTabbyPurchaseError,
  trackTamaraClose,
  trackTamaraPurchaseError,
} from "@/lib/analytics/events";
import {
  buildCartProperties,
  buildOrderProperties,
} from "@/lib/analytics/utils/build-properties";
import { PaymentStatus } from "@/lib/constants/payment-status";
import { getShippingTypeFromMethod } from "@/lib/utils/checkout/shipping-type";
import {
  isCheckoutComPaymentMethod,
  isTabbyPaymentMethod,
  isTamaraPaymentMethod,
} from "@/lib/utils/payment-method";

/**
 * Hook to handle payment status errors from query parameters.
 * Shows error toast when payment is cancelled or failed, then clears the query parameter.
 * Should be called in checkout page without any parameters.
 */
export function usePaymentStatusError() {
  const t = useTranslations("CheckoutPage");
  const { cart, isLoading } = useCart();
  const { storeConfig } = useStoreConfig();
  const { paymentStatus, setPaymentStatus } = usePaymentStatusParam();
  const { hasUserPropertiesSet } = useAnalytics();

  useEffect(() => {
    if (isLoading || !cart || !hasUserPropertiesSet || !storeConfig) return;

    const isCancelled = paymentStatus === PaymentStatus.Cancelled;
    const isFailed = paymentStatus === PaymentStatus.Failed;

    if (!isCancelled && !isFailed) return;

    const paymentMethod = cart.selectedPaymentMethod?.code || "";
    const cartProperties = buildCartProperties(cart, { storeConfig });
    const shippingMethod =
      cart.shippingAddress?.selected_shipping_method?.method_code || "";

    if (isCancelled) {
      // Track cc_payment_cancel when user cancels cc payment by clicking back button (only for checkout.com)
      if (isCheckoutComPaymentMethod(paymentMethod)) {
        trackCcPaymentCancel(cartProperties);
      } else if (isTabbyPaymentMethod(paymentMethod)) {
        trackTabbyClose(
          buildOrderProperties(cart, paymentMethod, shippingMethod)
        );
      } else if (isTamaraPaymentMethod(paymentMethod)) {
        trackTamaraClose(
          buildOrderProperties(cart, paymentMethod, shippingMethod)
        );
      } else {
        trackPurchasePaymentError(
          cartProperties,
          paymentMethod,
          shippingMethod
        );
      }

      toast({ title: t("errors.paymentCancelled"), type: "error" });
    } else {
      // Track purchase_paymenterror when payment failed (CC payment or tokenization failed, including Apple Pay)
      const shippingType = getShippingTypeFromMethod(shippingMethod);
      if (isTabbyPaymentMethod(paymentMethod)) {
        trackTabbyPurchaseError({
          ...cartProperties,
          payment_method: paymentMethod,
          shipping_type: shippingType,
        });
      } else if (isTamaraPaymentMethod(paymentMethod)) {
        trackTamaraPurchaseError({
          ...cartProperties,
          payment_method: paymentMethod,
          shipping_type: shippingType,
        });
      } else {
        trackPurchasePaymentError(
          cartProperties,
          paymentMethod,
          shippingMethod
        );
      }

      toast({ title: t("errors.paymentFailed"), type: "error" });
    }

    setTimeout(() => {
      setPaymentStatus(null);
    }, 2000);
    // Don't clear payment method info here - it's needed for cart refill restoration
    // It will be cleared after restoration in checkout-page.tsx
  }, [
    cart,
    hasUserPropertiesSet,
    isLoading,
    paymentStatus,
    setPaymentStatus,
    storeConfig,
    t,
  ]);
}
