"use server";

import { graphqlRequest } from "@/lib/clients/graphql";
import { CART_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/cart";
import { Locale } from "@/lib/constants/i18n";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok } from "@/lib/utils/service-result";

export async function createGuestCart({ locale }: { locale: Locale }) {
  try {
    const response = await graphqlRequest({
      query: CART_GRAPHQL_MUTATIONS.CREATE_GUEST_CART,
      storeCode: getStoreCode(locale),
    });

    if (
      !!response.errors?.length ||
      !response.data?.createGuestCart?.cart?.id
    ) {
      return failure("Failed to create guest cart");
    }

    return ok(response.data.createGuestCart.cart.id);
  } catch (error) {
    console.error("Failed to create guest cart:", error);
    return failure("Failed to create guest cart");
  }
}
