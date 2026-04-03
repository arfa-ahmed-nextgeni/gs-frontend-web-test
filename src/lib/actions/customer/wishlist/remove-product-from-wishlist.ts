"use server";

import { unauthorized } from "next/navigation";

import { getLocale, getTranslations } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CUSTOMER_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/customer";
import { DEFAULT_WISHLIST_ITEMS_QUERY_VARIABLES } from "@/lib/constants/api/graphql/wishlist-variables";
import { Locale } from "@/lib/constants/i18n";
import { Wishlist } from "@/lib/models/wishlist";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok } from "@/lib/utils/service-result";

export async function removeProductFromWishlist({
  itemId,
  wishlistId,
}: {
  itemId: string;
  wishlistId: string;
}) {
  const t = await getTranslations("CustomerWishlistPage.messages");
  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      unauthorized();
    }

    const locale = (await getLocale()) as Locale;

    const response = await graphqlRequest({
      authToken,
      query: CUSTOMER_GRAPHQL_MUTATIONS.REMOVE_PRODUCTS_FROM_WISHLIST,
      storeCode: getStoreCode(locale),
      variables: {
        wishlistId,
        wishlistItemsIds: [itemId],
        ...DEFAULT_WISHLIST_ITEMS_QUERY_VARIABLES,
      },
    });

    if (!!response.data?.removeProductsFromWishlist?.user_errors?.length) {
      return failure(t("failedToRemoveFromWishlist"));
    }

    const wishlist = response.data?.removeProductsFromWishlist?.wishlist;

    if (!wishlist) {
      return failure(t("failedToRemoveFromWishlist"));
    }

    return ok({
      message: t("removedFromWishlist"),
      wishlist: structuredClone(
        new Wishlist({
          customer: {
            wishlists: [wishlist],
          },
        })
      ),
    });
  } catch (error) {
    console.error("Error adding item to customer wishlist:", error);
    return failure(t("failedToRemoveFromWishlist"));
  }
}
