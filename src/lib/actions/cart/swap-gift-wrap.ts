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

export async function swapGiftWrapAction({
  giftMessage,
  newSku,
  oldItemUid,
  selectedOptionId,
}: {
  giftMessage?: {
    from?: string;
    message?: string;
    to?: string;
  };
  newSku: string;
  oldItemUid: string;
  selectedOptionId?: string;
}) {
  try {
    const authToken = await getAuthToken();
    const locale = (await getLocale()) as Locale;
    let cartId = (await getCartId()) as string;
    const storeCode = getStoreCode(locale);

    if (!newSku || newSku.trim() === "") {
      return failure("Product SKU is required.");
    }

    const normalizedOptionId =
      selectedOptionId &&
      typeof selectedOptionId === "string" &&
      selectedOptionId.trim() !== ""
        ? selectedOptionId
        : undefined;

    const removeItem = (targetCartId: string) =>
      graphqlRequest({
        authToken,
        query: CART_GRAPHQL_MUTATIONS.REMOVE_ITEM_FROM_CART,
        storeCode,
        variables: {
          input: {
            cart_id: targetCartId,
            cart_item_uid: oldItemUid,
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

    let removeResponse = await removeItem(cartId);

    if (authToken && isGraphqlAuthError(removeResponse)) {
      return unauthenticated();
    }

    if (authToken && hasRecoverableCartError(removeResponse)) {
      const refreshedCartId = await getCustomerCartId({ authToken, locale });

      if (!refreshedCartId) {
        return unauthenticated();
      }

      if (refreshedCartId !== cartId) {
        cartId = refreshedCartId;
        await setCartId(cartId);
      }

      removeResponse = await removeItem(cartId);
    }

    if (authToken && isGraphqlAuthError(removeResponse)) {
      return unauthenticated();
    }

    if (
      !!removeResponse.errors?.length ||
      !removeResponse.data?.removeItemFromCart?.cart
    ) {
      return failure(
        removeResponse?.errors?.[0]?.message ||
          "Failed to remove existing gift wrap"
      );
    }

    const addResponse = await graphqlRequest({
      authToken,
      query: CART_GRAPHQL_MUTATIONS.ADD_PRODUCTS_TO_CART_WITH_GIFT_MESSAGE,
      storeCode,
      variables: {
        cartId,
        cartItems: [
          {
            quantity: 1,
            selected_options: normalizedOptionId
              ? [normalizedOptionId]
              : undefined,
            sku: newSku,
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

    if (authToken && isGraphqlAuthError(addResponse)) {
      return unauthenticated();
    }

    const userErrors =
      addResponse.data?.addProductsToCartWithGiftMessage?.user_errors || [];

    if (userErrors.length || addResponse.errors?.length) {
      return failure(
        userErrors[0]?.message ||
          addResponse.errors?.[0]?.message ||
          "Failed to add new gift wrap"
      );
    }

    const cart = addResponse.data?.addProductsToCartWithGiftMessage?.cart;

    if (!cart) {
      return failure("Failed to add new gift wrap");
    }

    return ok(structuredClone(new Cart({ cart })));
  } catch (error) {
    console.error("Failed to swap gift wrap:", error);
    return failure("Failed to swap gift wrap");
  }
}
