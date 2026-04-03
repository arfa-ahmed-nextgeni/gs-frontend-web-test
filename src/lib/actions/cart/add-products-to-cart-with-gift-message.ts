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

export async function addProductsToCartWithGiftMessageAction({
  giftMessage,
  selectedOptionId,
  sku,
}: {
  giftMessage?: {
    from?: string;
    message?: string;
    to?: string;
  };
  selectedOptionId?: string;
  sku: string;
}) {
  try {
    const authToken = await getAuthToken();
    const locale = (await getLocale()) as Locale;
    const cartId = (await getCartId()) as string;

    if (!sku || sku.trim() === "") {
      return failure("Product SKU is required.");
    }

    if (
      selectedOptionId &&
      (typeof selectedOptionId !== "string" || selectedOptionId.trim() === "")
    ) {
      selectedOptionId = undefined;
    }

    const response = await graphqlRequest({
      authToken,
      query: CART_GRAPHQL_MUTATIONS.ADD_PRODUCTS_TO_CART_WITH_GIFT_MESSAGE,
      storeCode: getStoreCode(locale),
      variables: {
        cartId,
        cartItems: [
          {
            quantity: 1,
            selected_options: selectedOptionId ? [selectedOptionId] : undefined,
            sku,
          },
        ],
        giftMessage: giftMessage
          ? {
              message: giftMessage.message || "",
            }
          : undefined,
        ...DEFAULT_CART_ITEMS_QUERY_VARIABLES,
      },
    });

    const userErrors =
      response.data?.addProductsToCartWithGiftMessage?.user_errors || [];

    if (userErrors.length || response.errors?.length) {
      const errorMessage =
        userErrors[0]?.message ||
        response.errors?.[0]?.message ||
        "Failed to add item with gift message";

      return failure(errorMessage);
    }

    const cart = response.data?.addProductsToCartWithGiftMessage?.cart;

    if (!cart) {
      return failure("Failed to add item with gift message");
    }

    return ok(structuredClone(new Cart({ cart })));
  } catch (error) {
    console.error("Error adding item with gift message:", error);
    return failure("Failed to add item with gift message");
  }
}
