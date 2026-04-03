"use server";

import { getLocale } from "next-intl/server";

import { setCartId } from "@/lib/actions/cookies/cart";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CART_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/cart";
import { Locale } from "@/lib/constants/i18n";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok } from "@/lib/utils/service-result";

export async function mergeGuestCart({
  authToken,
  guestCartId,
}: {
  authToken: string;
  guestCartId: string;
}) {
  try {
    const locale = (await getLocale()) as Locale;
    const storeCode = getStoreCode(locale);

    const response = await graphqlRequest({
      authToken,
      query: CART_GRAPHQL_MUTATIONS.MERGE_CARTS,
      storeCode,
      variables: {
        source_cart_id: guestCartId,
      },
    });

    if (!!response.errors?.length) {
      return failure("Failed to merge guest cart to customer cart");
    }

    if (response.data?.mergeCarts?.id) {
      await setCartId(response.data?.mergeCarts.id);
    }

    return ok("Guest cart merged in customer cart successfully");
  } catch (error) {
    console.error("Failed to merge guest cart to customer cart:", error);
    return failure("Failed to merge guest cart to customer cart");
  }
}
