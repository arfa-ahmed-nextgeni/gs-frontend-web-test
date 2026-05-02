"use server";

import { getLocale } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getCustomerCartId } from "@/lib/actions/cart/get-customer-cart-id";
import { getCartId, setCartId } from "@/lib/actions/cookies/cart";
import { graphqlRequest, isGraphqlAuthError } from "@/lib/clients/graphql";
import { CART_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/cart";
import { DEFAULT_CART_ITEMS_QUERY_VARIABLES } from "@/lib/constants/api/graphql/cart-variables";
import { Locale } from "@/lib/constants/i18n";
import { Cart } from "@/lib/models/cart";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok, unauthenticated } from "@/lib/utils/service-result";

export async function removeProductFromCartAction({
  itemUid,
}: {
  itemUid: string;
}) {
  try {
    const authToken = await getAuthToken();

    const locale = (await getLocale()) as Locale;
    let cartId = (await getCartId()) as string;

    const removeItem = (targetCartId: string) =>
      graphqlRequest({
        authToken,
        query: CART_GRAPHQL_MUTATIONS.REMOVE_ITEM_FROM_CART,
        storeCode: getStoreCode(locale),
        variables: {
          input: {
            cart_id: targetCartId,
            cart_item_uid: itemUid,
          },
          ...DEFAULT_CART_ITEMS_QUERY_VARIABLES,
        },
      });

    const getApiErrorMessage = (
      response: Awaited<ReturnType<typeof removeItem>>
    ) => String(response?.errors?.[0]?.message || "").toLowerCase();

    const hasRecoverableCartError = (
      response: Awaited<ReturnType<typeof removeItem>>
    ) => {
      const errorMessage = getApiErrorMessage(response);
      return (
        errorMessage.includes("cart isn't active") ||
        errorMessage.includes("cart is not active") ||
        errorMessage.includes("cart_not_active") ||
        errorMessage.includes("could not find cart item with id")
      );
    };

    let response = await removeItem(cartId);

    if (authToken && isGraphqlAuthError(response)) {
      return unauthenticated();
    }

    if (authToken && hasRecoverableCartError(response)) {
      const refreshedCartId = await getCustomerCartId({ authToken, locale });

      if (!refreshedCartId) {
        return unauthenticated();
      }

      if (refreshedCartId !== cartId) {
        cartId = refreshedCartId;
        await setCartId(cartId);
      }

      response = await removeItem(cartId);
    }

    if (authToken && isGraphqlAuthError(response)) {
      return unauthenticated();
    }

    if (!!response.errors?.length || !response.data?.removeItemFromCart?.cart) {
      if (
        getApiErrorMessage(response).includes(
          "could not find cart item with id"
        )
      ) {
        return failure("Failed to remove item from cart");
      }

      return failure(
        response?.errors?.[0].message || "Failed to remove item from cart"
      );
    }

    const data = { cart: response.data.removeItemFromCart.cart };

    return ok(structuredClone(new Cart(data)));
  } catch (error) {
    console.error("Failed to remove item from cart:", error);
    return failure("Failed to remove item from cart");
  }
}
