import "server-only";

import { createGuestCart } from "@/lib/actions/cart/create-guest-cart";
import { getCustomerCartId } from "@/lib/actions/cart/get-customer-cart-id";
import { deleteCartId, setCartId } from "@/lib/actions/cookies/cart";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CART_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/cart";
import { CheckoutError } from "@/lib/constants/checkout-error";
import { Locale } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import { getStoreCode } from "@/lib/utils/country";
import { failure, isOk } from "@/lib/utils/service-result";

import type { PlaceOrderFailureResult } from "@/lib/types/checkout/place-order";

export async function validateCartForPlaceOrder({
  authToken,
  cartId,
  fallbackErrorMessage,
  locale,
}: {
  authToken?: null | string;
  cartId: null | string;
  fallbackErrorMessage: string;
  locale: Locale;
}) {
  if (!cartId) {
    await refreshCartCookieAfterValidationFailure({
      authToken,
      locale,
    });

    return createInvalidCartFailureResult(fallbackErrorMessage);
  }

  const validationResponse = await graphqlRequest({
    authToken,
    query: CART_GRAPHQL_QUERIES.GET_CART_VALIDATION,
    storeCode: getStoreCode(locale),
    variables: {
      cartId,
    },
  });

  const apiErrorMessage = validationResponse.errors?.[0]?.message;

  if (validationResponse.errors?.length) {
    await refreshCartCookieAfterValidationFailure({
      authToken,
      locale,
    });

    return createInvalidCartFailureResult(
      apiErrorMessage || fallbackErrorMessage
    );
  }

  const cart = validationResponse.data?.cart;

  if (!cart) {
    await refreshCartCookieAfterValidationFailure({
      authToken,
      locale,
    });

    return createInvalidCartFailureResult(fallbackErrorMessage);
  }

  return { cart };
}

function createInvalidCartFailureResult(
  errorMessage: string
): PlaceOrderFailureResult {
  return {
    ...failure(errorMessage),
    errorCode: CheckoutError.InvalidCart,
    redirectTo: ROUTES.ROOT,
  };
}

async function refreshCartCookieAfterValidationFailure({
  authToken,
  locale,
}: {
  authToken?: null | string;
  locale: Locale;
}) {
  try {
    if (authToken) {
      const refreshedCartId = await getCustomerCartId({
        authToken,
        locale,
      });

      if (refreshedCartId) {
        await setCartId(refreshedCartId);
        return;
      }
    } else {
      const guestCartResult = await createGuestCart({ locale });

      if (isOk(guestCartResult)) {
        await setCartId(guestCartResult.data);
        return;
      }
    }
  } catch (error) {
    console.error(
      "[placeOrderAction] Failed to refresh cart after validation failure:",
      error
    );
  }

  await deleteCartId();
}
