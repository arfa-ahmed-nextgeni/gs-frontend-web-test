"use client";

import { useEffect, useEffectEvent, useRef } from "react";

import { useIsReturningFromPaymentError } from "@/hooks/checkout/use-is-returning-from-payment-error";
import { trackCheckoutPayment } from "@/lib/analytics/events";

/**
 * Client component to track checkout_payment event
 * Placed in checkout payment methods section to track when the section is shown
 * (after skeleton UI disappears or when UI shows directly without skeleton)
 */
export function CheckoutPaymentTracker({
  shouldShowSkeleton,
}: {
  shouldShowSkeleton: boolean;
}) {
  const hasTracked = useRef(false);
  const wasShowingSkeleton = useRef(shouldShowSkeleton);
  const isInitialMount = useRef(true);
  const isReturningFromPaymentError = useIsReturningFromPaymentError();

  const trackCheckoutPaymentEvent = useEffectEvent(() => {
    if (isReturningFromPaymentError) {
      hasTracked.current = true;
      return;
    }

    trackCheckoutPayment();
    hasTracked.current = true;
  });

  useEffect(() => {
    // On initial mount, if skeleton is not showing, track immediately
    if (isInitialMount.current && !shouldShowSkeleton && !hasTracked.current) {
      trackCheckoutPaymentEvent();
      isInitialMount.current = false;
      wasShowingSkeleton.current = shouldShowSkeleton;
      return;
    }

    isInitialMount.current = false;

    // Track when skeleton disappears (transitions from true to false)
    if (
      wasShowingSkeleton.current &&
      !shouldShowSkeleton &&
      !hasTracked.current
    ) {
      trackCheckoutPaymentEvent();
    }

    // Update ref to track current skeleton state
    wasShowingSkeleton.current = shouldShowSkeleton;
  }, [shouldShowSkeleton]);

  useEffect(() => {
    return () => {
      hasTracked.current = false;
      wasShowingSkeleton.current = false;
      isInitialMount.current = true;
    };
  }, []);

  return null;
}
