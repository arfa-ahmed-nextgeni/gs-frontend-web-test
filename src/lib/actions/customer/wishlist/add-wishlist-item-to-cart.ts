"use server";

import { getLocale, getTranslations } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { graphqlRequest, isGraphqlAuthError } from "@/lib/clients/graphql";
import { CUSTOMER_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/customer";
import { DEFAULT_WISHLIST_ITEMS_QUERY_VARIABLES } from "@/lib/constants/api/graphql/wishlist-variables";
import { Locale } from "@/lib/constants/i18n";
import { Wishlist } from "@/lib/models/wishlist";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok, unauthenticated } from "@/lib/utils/service-result";

export async function addWishlistItemToCartAction({
  itemId,
  wishlistId,
}: {
  itemId: string;
  wishlistId: string;
}) {
  const tCommonErrors = await getTranslations("CommonErrors");
  let errorMessage = tCommonErrors("unknownError");
  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      return unauthenticated();
    }

    const locale = (await getLocale()) as Locale;

    const response = await graphqlRequest({
      authToken,
      query: CUSTOMER_GRAPHQL_MUTATIONS.ADD_WISHLIST_ITEMS_TO_CART,
      storeCode: getStoreCode(locale),
      variables: {
        wishlistId,
        wishlistItemIds: [itemId],
        ...DEFAULT_WISHLIST_ITEMS_QUERY_VARIABLES,
      },
    });

    if (isGraphqlAuthError(response)) {
      return unauthenticated();
    }

    if (!response.data?.addWishlistItemsToCart?.status) {
      if (
        response.data?.addWishlistItemsToCart
          ?.add_wishlist_items_to_cart_user_errors?.[0]?.message
      ) {
        errorMessage =
          response.data?.addWishlistItemsToCart
            ?.add_wishlist_items_to_cart_user_errors?.[0]?.message;
      }
      return failure(errorMessage);
    }

    const wishlist = response.data?.addWishlistItemsToCart?.wishlist;

    if (!wishlist) {
      return failure(errorMessage);
    }

    return ok({
      message: "Wishlist item added to cart successfully",
      wishlist: structuredClone(
        new Wishlist({
          customer: {
            wishlists: [wishlist],
          },
        })
      ),
    });
  } catch (error) {
    console.error("Failed to add wishlist item to cart:", error);
    return failure(errorMessage);
  }
}
