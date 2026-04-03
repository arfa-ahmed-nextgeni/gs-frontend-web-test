"use server";

import { unauthorized } from "next/navigation";

import { getAuthToken } from "@/lib/actions/cookies/auth";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CUSTOMER_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/customer";
import { StoreCode } from "@/lib/constants/i18n";

interface UpdateCustomerInput {
  // dob?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  password?: boolean;
}

export async function updateCustomer({
  input,
  storeCode,
}: {
  input: UpdateCustomerInput;
  storeCode: StoreCode;
}) {
  const authToken = await getAuthToken();

  if (!authToken) {
    unauthorized();
  }

  try {
    const response = await graphqlRequest({
      authToken,
      query: CUSTOMER_GRAPHQL_MUTATIONS.UPDATE_CUSTOMER,
      storeCode,
      variables: {
        input: {
          ...(input.email && { email: input.email }),
          ...(input.firstname && { firstname: input.firstname }),
          ...(input.lastname && { lastname: input.lastname }),
          ...(input.password !== undefined && {
            password: input.password as unknown as string,
          }),
        },
      },
    });

    if (response.errors) {
      return {
        data: null,
        error: response.errors[0]?.message || "Failed to update customer",
        success: false,
      };
    }

    if (response.data?.updateCustomer) {
      return {
        data: response.data,
        error: null,
        success: true,
      };
    }

    return {
      data: null,
      error: "No data received from update customer mutation",
      success: false,
    };
  } catch (error) {
    console.error("Error updating customer:", error);
    return {
      data: null,
      error: "Failed to update customer profile",
      success: false,
    };
  }
}
