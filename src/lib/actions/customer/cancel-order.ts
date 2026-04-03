import "server-only";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CUSTOMER_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/customer";
import { Locale } from "@/lib/constants/i18n";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok, unauthenticated } from "@/lib/utils/service-result";

export const cancelCustomerOrder = async (orderId: string, locale: Locale) => {
  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      return unauthenticated();
    }

    const response = await graphqlRequest({
      authToken,
      query: CUSTOMER_GRAPHQL_MUTATIONS.CANCEL_CUSTOMER_ORDER,
      storeCode: getStoreCode(locale),
      variables: {
        order_id: orderId,
      },
    });

    if (response.errors) {
      console.error("GraphQL errors:", response.errors);
      return failure(response.errors[0]?.message || "Failed to cancel order");
    }

    if (!response.data?.cancelCustomerOrder) {
      return failure("Failed to cancel order");
    }

    const result = response.data.cancelCustomerOrder;

    if (result.success) {
      return ok({
        message: result.message,
        order: result.order,
        orderDetail: result.customerOrderDetail,
        success: result.success,
      });
    } else {
      return failure(result.message || "Failed to cancel order");
    }
  } catch (error) {
    console.error("Error canceling customer order:", error);
    return failure("Failed to cancel order");
  }
};
