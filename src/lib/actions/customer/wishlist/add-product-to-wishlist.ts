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

export async function addProductToWishlist({
  selectedOptionId,
  sku,
  wishlistId,
}: {
  selectedOptionId?: string;
  sku: string;
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
      query: CUSTOMER_GRAPHQL_MUTATIONS.ADD_PRODUCTS_TO_WISHLIST,
      storeCode: getStoreCode(locale),
      variables: {
        wishlistId,
        wishlistItems: [
          {
            quantity: 1,
            selected_options: selectedOptionId ? [selectedOptionId] : undefined,
            sku,
          },
        ],
        ...DEFAULT_WISHLIST_ITEMS_QUERY_VARIABLES,
      },
    });

    if (!!response.data?.addProductsToWishlist?.user_errors?.length) {
      console.error(
        "Error adding item to customer wishlist:",
        response.data.addProductsToWishlist.user_errors
      );
      return failure(t("addToWishlistFailed"));
    }

    const wishlist = response.data?.addProductsToWishlist?.wishlist;

    if (!wishlist) {
      return failure(t("addToWishlistFailed"));
    }

    return ok({
      message: t("addToWishlistSuccess"),
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
    return failure(t("addToWishlistFailed"));
  }
}
