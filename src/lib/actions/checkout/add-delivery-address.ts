"use server";

import { revalidatePath } from "next/cache";

import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CUSTOMER_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/customer";
import { Locale, LOCALE_TO_STORE } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import { getLocaleInfo } from "@/lib/utils/locale";
import { getLocalePrefix } from "@/lib/utils/seo";
import { failure, ok } from "@/lib/utils/service-result";

import type {
  CountryCodeEnum,
  CustomerAddress,
  CustomerAddressInput,
} from "@/graphql/graphql";

interface AddDeliveryAddressPayload {
  addressLabel: "gift" | "home";
  city: string;
  district: string;
  firstName: string;
  ksaShortAddress: string;
  lastName: string;
  latitude?: number;
  longitude?: number;
  phoneNumber: string;
  postalCode: string;
  setAsDefault: boolean;
  street: string; // buildingName from form
}

type CreateCustomerAddressMutation = {
  createCustomerAddress: CustomerAddress;
};

type CreateCustomerAddressMutationVariables = {
  input: CustomerAddressInput;
};

export const addDeliveryAddress = async (
  payload: AddDeliveryAddressPayload
) => {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("CommonErrors");

  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      return failure("Authentication required");
    }

    const { region } = getLocaleInfo(locale);
    const storeCode = LOCALE_TO_STORE[locale];

    // Map region name to country code
    const countryCodeMap: Record<string, string> = {
      AE: "AE",
      KW: "KW",
      OM: "OM",
      SA: "SA",
    };

    const countryCode = (countryCodeMap[
      region as keyof typeof countryCodeMap
    ] || "SA") as CountryCodeEnum;

    const input: CustomerAddressInput = {
      address_label: payload.addressLabel,
      city: payload.city,
      country_code: countryCode,
      default_billing: payload.setAsDefault,
      default_shipping: payload.setAsDefault,
      firstname: payload.firstName,
      ksa_short_address: payload.ksaShortAddress,
      lastname: payload.lastName,
      latitude: payload.latitude != null ? payload.latitude.toString() : "",
      longitude: payload.longitude != null ? payload.longitude.toString() : "",
      region: {
        region: payload.district,
      },
      street: [payload.street || payload.district],
      telephone: payload.phoneNumber,
    };

    if (payload.postalCode) {
      input.postcode = payload.postalCode;
    }

    console.info("[addDeliveryAddress] Submitting address:", {
      input: JSON.stringify(input, null, 2),
      payload: JSON.stringify(payload, null, 2),
    });

    const response = await graphqlRequest<
      CreateCustomerAddressMutation,
      CreateCustomerAddressMutationVariables
    >({
      authToken,
      query: CUSTOMER_GRAPHQL_MUTATIONS.CREATE_CUSTOMER_ADDRESS as any,
      storeCode,
      variables: {
        input,
      },
    });

    console.info("[addDeliveryAddress] CreateCustomerAddress response:", {
      createCustomerAddress: response.data?.createCustomerAddress,
      errors: response.errors,
      hasErrors: !!(response.errors && response.errors.length > 0),
      status: "response received",
    });

    if (response.errors && response.errors.length > 0) {
      const errorMessage =
        response?.errors?.[0]?.message || "Failed to add address";
      console.error("[addDeliveryAddress] Error:", errorMessage);
      return failure(errorMessage);
    }

    if (!response.data?.createCustomerAddress) {
      return failure("No data returned from server");
    }

    revalidatePath(
      `${getLocalePrefix(locale)}${ROUTES.CUSTOMER.PROFILE.ADDRESSES.ROOT}`
    );

    // console.info("[addDeliveryAddress] Address created successfully:", {
    //   address: response.data.createCustomerAddress,
    //   addressId: response.data.createCustomerAddress.id,
    //   isKsaVerified: response.data.createCustomerAddress.is_ksa_verified,
    // });

    return ok(response.data.createCustomerAddress);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message.toLowerCase() : "";

    console.error("[addDeliveryAddress] Exception:", {
      error,
      message: error instanceof Error ? error.message : String(error),
    });

    if (
      errorMessage.includes("timeout") ||
      errorMessage.includes("timed out") ||
      errorMessage.includes("aborted") ||
      errorMessage.includes("deadline")
    ) {
      return failure(t("unknownError"));
    }

    return failure(
      error instanceof Error ? error.message : "Failed to save address"
    );
  }
};
