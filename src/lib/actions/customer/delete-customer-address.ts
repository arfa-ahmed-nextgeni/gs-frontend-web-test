"use server";

import { revalidatePath } from "next/cache";
import { unauthorized } from "next/navigation";

import { getLocale, getTranslations } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CUSTOMER_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/customer";
import { Locale, LOCALE_TO_STORE } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import { failure, ok } from "@/lib/utils/service-result";

export const deleteCustomerAddress = async ({ id }: { id: string }) => {
  const t = await getTranslations("CustomerAddressesPage.messages");

  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      unauthorized();
    }

    const locale = (await getLocale()) as Locale;

    const response = await graphqlRequest({
      authToken,
      query: CUSTOMER_GRAPHQL_MUTATIONS.DELETE_CUSTOMER_ADDRESS,
      storeCode: LOCALE_TO_STORE[locale],
      variables: {
        id: +id,
      },
    });

    if ((response.errors && response.errors.length > 0) || !response.data) {
      const errorMessage =
        response?.errors?.[0]?.message || t("addressDeleteFailed");

      return failure(errorMessage);
    }

    revalidatePath(ROUTES.CUSTOMER.PROFILE.ADDRESSES.ROOT);

    return ok(t("addressDeleteSuccess"));
  } catch (error) {
    console.error("Error deleting card:", error);

    return failure(t("addressDeleteFailed"));
  }
};
