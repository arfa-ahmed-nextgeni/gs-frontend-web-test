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

export async function applyCouponToCartAction({
  couponCode,
}: {
  couponCode: string;
}) {
  try {
    const authToken = await getAuthToken();
    const locale = (await getLocale()) as Locale;
    const cartId = (await getCartId()) as string;

    const response = await graphqlRequest({
      authToken,
      query: CART_GRAPHQL_MUTATIONS.APPLY_COUPON_TO_CART,
      storeCode: getStoreCode(locale),
      variables: {
        cartId,
        couponCode,
        ...DEFAULT_CART_ITEMS_QUERY_VARIABLES,
      },
    });

    if (response.errors?.length) {
      const errorMessage =
        response.errors?.[0]?.message || "Failed to apply coupon";
      return failure(errorMessage);
    }

    const cart = response.data?.applyCouponToCart?.cart;

    if (!cart) {
      return failure("Failed to apply coupon");
    }

    return ok(structuredClone(new Cart({ cart })));
  } catch (error) {
    console.error("Error applying coupon:", error);
    return failure("Failed to apply coupon");
  }
}
