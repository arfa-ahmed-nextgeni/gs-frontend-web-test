"use server";

import { getLocale } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getCartId } from "@/lib/actions/cookies/cart";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CART_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/cart";
import { DEFAULT_CART_ITEMS_QUERY_VARIABLES } from "@/lib/constants/api/graphql/cart-variables";
import { Locale } from "@/lib/constants/i18n";
import { Cart } from "@/lib/models/cart";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok } from "@/lib/utils/service-result";

export async function removeProductFromCartAction({
  itemUid,
}: {
  itemUid: string;
}) {
  try {
    const authToken = await getAuthToken();

    const locale = (await getLocale()) as Locale;
    const cartId = (await getCartId()) as string;

    const response = await graphqlRequest({
      authToken,
      query: CART_GRAPHQL_MUTATIONS.REMOVE_ITEM_FROM_CART,
      storeCode: getStoreCode(locale),
      variables: {
        input: {
          cart_id: cartId,
          cart_item_uid: itemUid,
        },
        ...DEFAULT_CART_ITEMS_QUERY_VARIABLES,
      },
    });

    if (!!response.errors?.length || !response.data?.removeItemFromCart?.cart) {
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
