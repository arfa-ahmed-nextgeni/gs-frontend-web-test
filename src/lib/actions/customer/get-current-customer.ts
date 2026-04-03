import "server-only";

import { cache } from "react";

import { connection } from "next/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getCustomerByAuthToken } from "@/lib/actions/customer/get-customer-by-auth-token";
import { failure, ok, unauthenticated } from "@/lib/utils/service-result";

export const getCurrentCustomer = cache(async () => {
  await connection();

  const authToken = await getAuthToken();

  if (!authToken) {
    return unauthenticated();
  }

  try {
    const customer = await getCustomerByAuthToken(authToken, {
      throwOnError: true,
    });
    if (!customer) {
      return unauthenticated();
    }

    return ok(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return failure("Failed to fetch customer profile");
  }
});
