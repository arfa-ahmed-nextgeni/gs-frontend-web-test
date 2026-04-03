"use server";

import { getLocale, getTranslations } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getCustomerCartId } from "@/lib/actions/cart/get-customer-cart-id";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { getCartId, setCartId } from "@/lib/actions/cookies/cart";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CART_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/cart";
import { DEFAULT_CART_ITEMS_QUERY_VARIABLES } from "@/lib/constants/api/graphql/cart-variables";
import { Cart } from "@/lib/models/cart";
import { failure, ok } from "@/lib/utils/service-result";

import type { Locale } from "@/lib/constants/i18n";

export async function addProductToCartAction({
  selectedOptionId,
  sku,
}: {
  selectedOptionId?: string;
  sku: string;
}) {
  const tCartErrors = await getTranslations("CartPage.errors");
  try {
    const authToken = await getAuthToken();

    const locale = (await getLocale()) as Locale;
    const storeConfigResult = await getStoreConfig({ locale });

    const addToCart = async (cartId: string) =>
      graphqlRequest({
        authToken,
        query: CART_GRAPHQL_MUTATIONS.ADD_PRODUCTS_TO_CART,
        storeCode: storeConfigResult.data.store?.code,
        variables: {
          cartId,
          cartItems: [
            {
              quantity: 1,
              selected_options: selectedOptionId
                ? [selectedOptionId]
                : undefined,
              sku,
            },
          ],
          ...DEFAULT_CART_ITEMS_QUERY_VARIABLES,
        },
      });

    const getApiErrorMessage = (
      response: Awaited<ReturnType<typeof addToCart>>
    ) =>
      response.data?.addProductsToCart?.user_errors?.[0]?.message ||
      response.errors?.[0].message ||
      "";

    const getLocalizedErrorMessage = (
      response: Awaited<ReturnType<typeof addToCart>>
    ) => {
      const errorMessage = getApiErrorMessage(response).toLowerCase();

      if (
        errorMessage.includes("cart isn't active") ||
        errorMessage.includes("cart is not active") ||
        errorMessage.includes("cart_not_active")
      ) {
        return tCartErrors("cartNotActive");
      }

      return getApiErrorMessage(response) || tCartErrors("failedToAddItem");
    };

    const hasInactiveCartError = (
      response: Awaited<ReturnType<typeof addToCart>>
    ) => {
      const errorMessage = getApiErrorMessage(response).toLowerCase();
      return (
        errorMessage.includes("cart isn't active") ||
        errorMessage.includes("cart is not active") ||
        errorMessage.includes("cart_not_active")
      );
    };

    let cartId = await getCartId();

    if (authToken && !cartId) {
      cartId = await getCustomerCartId({ authToken, locale });
      if (cartId) {
        await setCartId(cartId);
      }
    }

    if (!cartId) {
      return failure(tCartErrors("failedToResolveCart"));
    }

    if (
      selectedOptionId &&
      (typeof selectedOptionId !== "string" || selectedOptionId.trim() === "")
    ) {
      selectedOptionId = undefined;
    }

    let response = await addToCart(cartId);

    if (authToken && hasInactiveCartError(response)) {
      const refreshedCartId = await getCustomerCartId({ authToken, locale });
      if (refreshedCartId && refreshedCartId !== cartId) {
        cartId = refreshedCartId;
        await setCartId(cartId);
      }

      if (cartId) {
        response = await addToCart(cartId);
      }
    }

    if (
      !!response.data?.addProductsToCart?.user_errors?.length ||
      !!response.errors?.length ||
      !response.data?.addProductsToCart?.cart
    ) {
      const errorMessage = getLocalizedErrorMessage(response);

      return failure(errorMessage);
    }

    const data = { cart: response.data.addProductsToCart.cart };

    return ok(structuredClone(new Cart(data)));
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return failure(tCartErrors("failedToAddItem"));
  }
}
