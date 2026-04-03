import "server-only";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CUSTOMER_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/customer";
import { Locale } from "@/lib/constants/i18n";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok, unauthenticated } from "@/lib/utils/service-result";

export const reorderCustomerOrder = async (
  increment_id: string,
  reorder: boolean = false,
  locale: Locale
) => {
  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      return unauthenticated();
    }

    const response = await graphqlRequest({
      authToken,
      query: CUSTOMER_GRAPHQL_MUTATIONS.REORDER_CUSTOMER_ORDER,
      storeCode: getStoreCode(locale),
      variables: {
        increment_id,
        reorder,
      },
    });

    if (response.errors) {
      return failure(response.errors[0]?.message || "Failed to reorder");
    }

    if (!response.data?.gsRefillCart) {
      return failure("Failed to reorder");
    }

    const result = response.data.gsRefillCart;

    if (result.success) {
      return ok({
        cart_id: result.cart_id,
        message: result.message,
        reorder: result.reorder,
        success: result.success,
      });
    } else {
      return failure(result.message || "Failed to reorder");
    }
  } catch (error) {
    console.error("Error reordering customer order:", error);
    return failure("Failed to reorder customer order");
  }
};
