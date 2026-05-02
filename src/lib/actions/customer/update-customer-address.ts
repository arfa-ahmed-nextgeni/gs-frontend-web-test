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
import { Locale, LOCALE_TO_STORE, StoreCode } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import {
  AddressFormField,
  addressFormSchema,
  AddressFormSchemaType,
} from "@/lib/forms/manage-address";
import { isGlobalStore } from "@/lib/utils/country";
import { getLocaleInfo } from "@/lib/utils/locale";
import { failure, ok } from "@/lib/utils/service-result";

// const GENERIC_ADDRESS_ERROR_MESSAGE = "Something went wrong, please try again";

export const updateCustomerAddress = async ({
  data,
  id,
}: {
  data: AddressFormSchemaType;
  id: number;
}) => {
  const t = await getTranslations("CustomerAddAddressPage.messages");
  const commonT = await getTranslations("CommonErrors");

  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      unauthorized();
    }

    const locale = (await getLocale()) as Locale;

    const { region } = getLocaleInfo(locale);

    const storeCode = LOCALE_TO_STORE[locale];
    const isSaudiStore =
      storeCode === StoreCode.ar_sa || storeCode === StoreCode.en_sa;

    const globalStore = isGlobalStore(storeCode);

    const payload = addressFormSchema(storeCode).parse(data);

    const isGiftAddress =
      payload[AddressFormField.AddressLabel]?.toLowerCase() === "gift";

    const input: CustomerAddressInput = {
      address_label: payload[AddressFormField.AddressLabel] || undefined,
      city:
        typeof payload[AddressFormField.City] === "string"
          ? payload[AddressFormField.City]
          : payload[AddressFormField.City].label,
      country_code: globalStore
        ? (payload[AddressFormField.Country].value as CountryCodeEnum)
        : (region as CountryCodeEnum),
      default_billing: isGiftAddress
        ? false
        : payload[AddressFormField.SaveAsDefault],
      default_shipping: isGiftAddress
        ? false
        : payload[AddressFormField.SaveAsDefault],
      firstname: payload[AddressFormField.FirstName],
      lastname: payload[AddressFormField.LastName],
      postcode: payload[AddressFormField.PostalCode],
      region: {
        region:
          typeof payload[AddressFormField.Area] === "string"
            ? payload[AddressFormField.Area]
            : payload[AddressFormField.Area].value,
      },
      street: globalStore
        ? [
            payload[AddressFormField.Street],
            payload[AddressFormField.BuildingName],
          ]
        : [payload[AddressFormField.BuildingName]],
      telephone: `${payload[AddressFormField.PhoneNumber]?.countryCode}${payload[AddressFormField.PhoneNumber]?.number}`,
      ...(payload[AddressFormField.Latitude] && {
        latitude: payload[AddressFormField.Latitude],
      }),
      ...(payload[AddressFormField.Longitude] && {
        longitude: payload[AddressFormField.Longitude],
      }),
      ...(isSaudiStore &&
        payload[AddressFormField.KsaShortAddress] && {
          ksa_short_address: payload[AddressFormField.KsaShortAddress],
        }),
      ...(isSaudiStore &&
        payload[AddressFormField.KsaAdditionalNumber] && {
          ksa_additional_number: payload[AddressFormField.KsaAdditionalNumber],
        }),
      ...(isSaudiStore &&
        payload[AddressFormField.KsaBuildingNumber] && {
          ksa_building_number: payload[AddressFormField.KsaBuildingNumber],
        }),
    };

    if (globalStore) {
      if (payload[AddressFormField.State].value) {
        input.state_id = +payload[AddressFormField.State].value;
      }

      if (payload[AddressFormField.MiddleName]) {
        input.middlename = payload[AddressFormField.MiddleName];
      }
    }
    // console.info("[updateCustomerAddress] input:", JSON.stringify(input, null, 2));

    const response = await graphqlRequest<
      UpdateCustomerAddressMutation,
      UpdateCustomerAddressMutationVariables
    >({
      authToken,
      query: CUSTOMER_GRAPHQL_MUTATIONS.UPDATE_CUSTOMER_ADDRESS,
      storeCode: LOCALE_TO_STORE[locale],
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
    const errorMessage =
      error instanceof Error ? error.message.toLowerCase() : "";

    console.error("Error updating address:", error);

    if (
      errorMessage.includes("timeout") ||
      errorMessage.includes("timed out") ||
      errorMessage.includes("aborted") ||
      errorMessage.includes("deadline")
    ) {
      return failure(commonT("unknownError"));
    }

    return failure(t("addressUpdateFailed"));
  }
};
