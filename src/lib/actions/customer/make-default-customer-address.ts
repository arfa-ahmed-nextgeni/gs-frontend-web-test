"use server";

import { revalidatePath } from "next/cache";
import { unauthorized } from "next/navigation";

import { getLocale, getTranslations } from "next-intl/server";

import {
  CountryCodeEnum,
  type CustomerAddressInput,
  type UpdateCustomerAddressMutation,
  type UpdateCustomerAddressMutationVariables,
} from "@/graphql/graphql";
import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CUSTOMER_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/customer";
import { Locale } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import { getStoreCode, isGlobalStore } from "@/lib/utils/country";
import { getLocaleInfo } from "@/lib/utils/locale";
import { failure, ok } from "@/lib/utils/service-result";

export const makeDefaultCustomerAddress = async ({
  id,
  rawData,
}: {
  id: number;
  rawData: Record<string, unknown>;
}) => {
  const t = await getTranslations("CustomerAddAddressPage.messages");

  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      unauthorized();
    }

    const locale = (await getLocale()) as Locale;

    const { region } = getLocaleInfo(locale);

    const storeCode = getStoreCode(locale);

    const globalStore = isGlobalStore(storeCode);

    delete rawData.id;

    const input: CustomerAddressInput = {
      ...rawData,
      country_code: globalStore
        ? (rawData.country_code as CountryCodeEnum)
        : (region as CountryCodeEnum),
      default_billing: true,
      default_shipping: true,
    };

    if (globalStore) {
      if (rawData.region_id) {
        input.state_id = +rawData.region_id;
      }
    }

    const response = await graphqlRequest<
      UpdateCustomerAddressMutation,
      UpdateCustomerAddressMutationVariables
    >({
      authToken,
      query: CUSTOMER_GRAPHQL_MUTATIONS.UPDATE_CUSTOMER_ADDRESS,
      storeCode,
      variables: {
        id,
        input,
      },
    });

    if ((response.errors && response.errors.length > 0) || !response.data) {
      const errorMessage =
        response?.errors?.[0]?.message || t("addressUpdateFailed");

      return failure(errorMessage);
    }

    revalidatePath(ROUTES.CUSTOMER.PROFILE.ADDRESSES.ROOT);

    return ok(t("addressUpdateSuccess"));
  } catch (error) {
    console.error("Error updating address:", error);

    return failure(t("addressUpdateFailed"));
  }
};
