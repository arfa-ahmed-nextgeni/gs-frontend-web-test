import { useEffect, useMemo } from "react";

import { useCustomerQuery } from "@/hooks/queries/use-customer-query";
import { setSnapCapiUserData } from "@/lib/analytics";
import { buildUserPropertiesFromCustomer } from "@/lib/analytics/utils/build-properties";

import type { UserProperties } from "@/lib/analytics/models/event-models";

/**
 * Hook to get user properties for analytics events
 * Automatically fetches customer data, resolves customer ID, and builds user properties
 * Also sets Snap CAPI user data (first/last name) for fn/ln hashing - raw names never sent in events
 * @returns User properties object or undefined if customer data is not available
 */
export function useUserProperties(): Partial<UserProperties> | undefined {
  const { data: customer } = useCustomerQuery();

  useEffect(() => {
    if (customer) {
      setSnapCapiUserData(customer.firstName, customer.lastName);
    } else {
      setSnapCapiUserData(undefined, undefined);
    }
  }, [customer]);

  return useMemo(() => buildUserPropertiesFromCustomer(customer), [customer]);
}
