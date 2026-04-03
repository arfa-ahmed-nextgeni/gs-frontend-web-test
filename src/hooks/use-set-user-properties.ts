import { useEffect, useRef } from "react";

import { useAnalytics } from "@/contexts/analytics-context";
import { useUI } from "@/contexts/use-ui";
import { useCustomerQuery } from "@/hooks/queries/use-customer-query";
import {
  resetUserProperties,
  setUserPropertiesFromCustomer,
} from "@/lib/analytics/events";
import { SessionStorageKey } from "@/lib/constants/session-storage";
import { resolveCustomerId } from "@/lib/utils/customer-id-storage";
import {
  removeSessionStorage,
  setSessionStorage,
} from "@/lib/utils/session-storage";

/**
 * Hook to set Amplitude user properties when customer data is available
 * Should be called once in the app root to ensure user properties are set after login
 */
export function useSetUserProperties() {
  const { isAuthorized } = useUI();
  const { data: customer } = useCustomerQuery();
  const hasSetProperties = useRef(false);
  const { isReady } = useAnalytics();

  useEffect(() => {
    if (!isReady) return;

    // Only set user properties when authorized and customer data is available
    // Use ref to prevent setting properties multiple times
    if (isReady && isAuthorized && customer && !hasSetProperties.current) {
      const customerId = resolveCustomerId(customer);

      setUserPropertiesFromCustomer({ ...customer, id: customerId ?? null });

      // Store customer email in sessionStorage for meta properties
      // This is used to determine meta.is_dummy (true when user has no email)
      if (customer.email) {
        setSessionStorage(SessionStorageKey.CUSTOMER_EMAIL, customer.email);
      } else {
        // Store empty string to indicate user has no email
        setSessionStorage(SessionStorageKey.CUSTOMER_EMAIL, "");
      }

      hasSetProperties.current = true;
    }

    // Reset when user logs out or becomes unauthorized
    if (!isAuthorized && hasSetProperties.current) {
      hasSetProperties.current = false;
      resetUserProperties();
      // Clear customer email from sessionStorage on logout
      removeSessionStorage(SessionStorageKey.CUSTOMER_EMAIL);
    }
  }, [isReady, isAuthorized, customer]);
}
