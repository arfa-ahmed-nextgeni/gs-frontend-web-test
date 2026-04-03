"use server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getCartId } from "@/lib/actions/cookies/cart";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CART_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/cart";
import { DEFAULT_CART_ITEMS_QUERY_VARIABLES } from "@/lib/constants/api/graphql/cart-variables";
import { StoreCode } from "@/lib/constants/i18n";
import { Cart } from "@/lib/models/cart";
import { failure, ok } from "@/lib/utils/service-result";

export async function applyRewardPointsToCartAction({
  storeCode,
}: {
  storeCode: StoreCode;
}) {
  try {
    const authToken = await getAuthToken();
    const cartId = (await getCartId()) as string;

    const response = await graphqlRequest({
      authToken,
      query: CART_GRAPHQL_MUTATIONS.APPLY_REWARD_POINTS_TO_CART,
      storeCode,
      variables: {
        cartId,
        ...DEFAULT_CART_ITEMS_QUERY_VARIABLES,
      },
    });

    if (response.errors?.length) {
      const errorMessage =
        response.errors?.[0]?.message || "Failed to apply reward points";
      return failure(errorMessage);
    }

    const cart = response.data?.applyRewardPointsToCart?.cart;

    if (!cart) {
      return failure("Failed to apply reward points");
    }

    return ok(structuredClone(new Cart({ cart })));
  } catch (error) {
    console.error("Error applying reward points:", error);
    return failure("Failed to apply reward points");
  }
}
