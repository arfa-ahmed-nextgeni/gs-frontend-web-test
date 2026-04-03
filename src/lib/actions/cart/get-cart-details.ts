import "server-only";

import { cache } from "react";

import { SortEnum, SortQuoteItemsEnum } from "@/graphql/graphql";
import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { createGuestCart } from "@/lib/actions/cart/create-guest-cart";
import { getCustomerCartId } from "@/lib/actions/cart/get-customer-cart-id";
import { getCartId, setCartId } from "@/lib/actions/cookies/cart";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CART_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/cart";
import { Cart } from "@/lib/models/cart";
import { getStoreCode } from "@/lib/utils/country";
import {
  failure,
  isError,
  ok,
  unauthenticated,
} from "@/lib/utils/service-result";

import type { Locale } from "@/lib/constants/i18n";

export const getCartDetails = ({
  locale,
  page,
  pageSize,
  persistCartId = false,
}: {
  locale: Locale;
  page: number;
  pageSize: number;
  persistCartId?: boolean;
}) => getCartDetailsCached(locale, page, pageSize, persistCartId);

const getCartDetailsCached = cache(
  async (
    locale: Locale,
    page: number,
    pageSize: number,
    persistCartId: boolean
  ) => {
    const authToken = await getAuthToken();
    try {
      const fetchCartWithId = async (cartId: string, authToken?: string) => {
        const response = await graphqlRequest({
          authToken,
          query: CART_GRAPHQL_QUERIES.GET_CART_DETAILS,
          storeCode: getStoreCode(locale),
          variables: {
            cartId,
            page,
            pageSize,
            sort: {
              field: SortQuoteItemsEnum.UpdatedAt,
              order: SortEnum.Desc,
            },
          },
        });
        return response;
      };

      let cartId = await getCartId();

      if (authToken) {
        // logged in
        if (!cartId) {
          cartId = await getCustomerCartId({ authToken, locale });
          if (!cartId) {
            return unauthenticated();
          }

          if (persistCartId) {
            await setCartId(cartId);
          }
        }

        let response = await fetchCartWithId(cartId, authToken);

        if (!response.data?.cart?.id) {
          const refreshedCartId = await getCustomerCartId({
            authToken,
            locale,
          });

          if (!refreshedCartId) {
            return unauthenticated();
          }

          if (refreshedCartId !== cartId) {
            cartId = refreshedCartId;
            if (persistCartId) {
              await setCartId(cartId);
            }
          }

          response = await fetchCartWithId(cartId, authToken);
        }

        if (!response.data?.cart?.id) {
          return failure("Failed to fetch logged in user cart");
        }

        return ok(new Cart(response.data));
      } else {
        // guest
        if (!cartId) {
          const response = await createGuestCart({ locale });

          if (isError(response)) {
            return failure("Failed to create guest cart");
          }

          cartId = response.data;
          if (persistCartId) {
            await setCartId(cartId);
          }
        }

        let response = await fetchCartWithId(cartId);

        if (!response.data?.cart?.id) {
          const newCartResponse = await createGuestCart({ locale });

          if (isError(newCartResponse)) {
            return failure("Failed to create guest cart after invalid cart ID");
          }

          cartId = newCartResponse.data;
          if (persistCartId) {
            await setCartId(cartId);
          }

          response = await fetchCartWithId(cartId);

          if (!response.data?.cart?.id) {
            return failure(
              "Failed to fetch cart details after creating new cart"
            );
          }
        }

        return ok(new Cart(response.data));
      }
    } catch (error) {
      console.error("Failed to fetch cart details: ", error);
      return failure("Failed to fetch cart details");
    }
  }
);
