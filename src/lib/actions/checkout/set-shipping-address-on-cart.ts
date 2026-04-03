"use server";

import { getLocale, getTranslations } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getCartId } from "@/lib/actions/cookies/cart";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CART_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/cart";
import { Locale } from "@/lib/constants/i18n";
import { getCommonErrorMessage } from "@/lib/utils/common-error-message";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok } from "@/lib/utils/service-result";

type ShippingAddressOnCartResult = {
  availablePaymentMethods?: Array<{
    code?: null | string;
    downtime_alert?: null | string;
    title?: null | string;
  }>;
  availableShippingMethods?: Array<{
    amount?: {
      currency: string;
      value: number;
    };
    carrier_code: string;
    carrier_title: string;
    delivery_time?: string;
    method_code?: string;
    method_title?: string;
  }>;
  shippingAddresses?: Array<null | Record<string, unknown>>;
};

export async function setShippingAddressOnCartAction({
  customerAddressId,
}: {
  customerAddressId: string;
}) {
  const tCommonErrors = await getTranslations("CommonErrors");
  try {
    const authToken = await getAuthToken();
    const locale = (await getLocale()) as Locale;
    const cartId = await getCartId();

    if (!cartId) {
      return failure("No active cart found");
    }

    const numericAddressId = Number(customerAddressId);

    if (!Number.isFinite(numericAddressId)) {
      return failure("Invalid address selected");
    }

    const shippingResponse: any = await graphqlRequest<any, any>({
      authToken,
      query: CART_GRAPHQL_MUTATIONS.SET_SHIPPING_ADDRESSES_ON_CART,
      storeCode: getStoreCode(locale),
      variables: {
        cartId,
        shippingAddresses: [
          {
            customer_address_id: numericAddressId,
          },
        ],
      } as any,
    });

    if (shippingResponse.errors?.length) {
      const errorMessage =
        shippingResponse.errors?.[0]?.message ||
        "Failed to set shipping address";
      return failure(errorMessage);
    }

    const shippingCart =
      shippingResponse.data?.setShippingAddressesOnCart?.cart ?? null;

    if (!shippingCart) {
      return failure("Failed to set shipping address");
    }
    const shippingMethods =
      shippingCart?.shipping_addresses
        ?.flatMap((address: any) => address?.available_shipping_methods ?? [])
        .filter(Boolean) ?? [];

    const normalizedShippingMethods = shippingMethods.map((method: any) => ({
      amount: method?.amount
        ? {
            currency: method.amount.currency,
            value: method.amount.value,
          }
        : undefined,
      carrier_code: method?.carrier_code ?? "",
      carrier_title: method?.carrier_title ?? "",
      delivery_time:
        typeof method?.delivery_time === "string"
          ? method.delivery_time
          : undefined,
      method_code:
        typeof method?.method_code === "string"
          ? method.method_code
          : undefined,
      method_title:
        typeof method?.method_title === "string"
          ? method.method_title
          : undefined,
    }));

    const result = {
      availablePaymentMethods:
        shippingCart?.available_payment_methods?.filter(Boolean),
      availableShippingMethods: normalizedShippingMethods,
      shippingAddresses: shippingCart?.shipping_addresses ?? undefined,
    };

    return ok<ShippingAddressOnCartResult>(result);
  } catch (error) {
    console.error("Error setting shipping address on cart:", error);
    return failure(
      getCommonErrorMessage({
        error,
        fallbackMessage: "Failed to set shipping address",
        tCommonErrors,
      })
    );
  }
}
