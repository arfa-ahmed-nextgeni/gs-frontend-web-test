"use client";

import { useEffect, useRef } from "react";

import { useAnalytics } from "@/contexts/analytics-context";
import { useUserProperties } from "@/hooks/analytics/use-user-properties";
import { useCustomerQuery } from "@/hooks/queries/use-customer-query";
import { trackLaunch } from "@/lib/analytics/events";
import { SessionStorageKey } from "@/lib/constants/session-storage";
import {
  hasSessionStorage,
  removeSessionStorage,
  setSessionStorage,
} from "@/lib/utils/session-storage";

/**
 * Fires the launch event when analytics is ready and user state has settled:
 * - Guests: fire as soon as analytics is ready.
 * - Logged-in: fire when analytics is ready and customer query has settled (success or error)
 *   so launch includes user data when available.
 * Skips launch when returning from checkout redirect (payment-success, refill-cart, or external
 * payment) - same session, not a new app launch. Flag is set client-side before redirect.
 * Must be mounted inside both AnalyticsProvider and UIProvider.
 */
export function AnalyticsLaunchTracker() {
  const { isReady } = useAnalytics();
  const userProperties = useUserProperties();
  const { isEnabled, isFetched } = useCustomerQuery();
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (hasFiredRef.current) return;
    if (hasSessionStorage(SessionStorageKey.ANALYTICS_LAUNCH_TRACKED)) return;
    if (!isReady) return;

    // Skip launch when returning from checkout redirect (COD, payment fail, or external gateway)
    if (hasSessionStorage(SessionStorageKey.SKIP_LAUNCH_ON_CHECKOUT_RETURN)) {
      removeSessionStorage(SessionStorageKey.SKIP_LAUNCH_ON_CHECKOUT_RETURN);
      setSessionStorage(SessionStorageKey.ANALYTICS_LAUNCH_TRACKED, "true");
      hasFiredRef.current = true;
      return;
    }
    // For guests we fire immediately; for logged-in we wait until customer query has settled
    if (isEnabled && !isFetched) return;

    hasFiredRef.current = true;
    setSessionStorage(SessionStorageKey.ANALYTICS_LAUNCH_TRACKED, "true");
    trackLaunch(userProperties ?? undefined);
  }, [isReady, isEnabled, isFetched, userProperties]);

  return null;
}
