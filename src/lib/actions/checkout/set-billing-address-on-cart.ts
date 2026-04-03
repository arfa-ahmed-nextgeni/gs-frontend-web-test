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

import type {
  BillingAddressInput,
  CartAddressInput,
  TypedDocumentString,
} from "@/graphql/graphql";

type BillingAddressOnCartResult = {
  availablePaymentMethods?: Array<PaymentMethodSummary>;
};

type PaymentMethodSummary = {
  code?: null | string;
  downtime_alert?: null | string;
  title?: null | string;
};

type SetBillingAddressOnCartResponse = {
  setBillingAddressOnCart?: {
    cart?: {
      available_payment_methods?: Array<null | PaymentMethodSummary> | null;
    } | null;
  } | null;
};

type SetBillingAddressOnCartVariables = {
  billingAddress: BillingAddressInput;
  cartId: string;
};

export async function setBillingAddressOnCartAction({
  address,
  customerAddressId,
}: {
  address?: CartAddressInput;
  customerAddressId?: string;
}) {
  const tCommonErrors = await getTranslations("CommonErrors");
  try {
    const authToken = await getAuthToken();
    const locale = (await getLocale()) as Locale;
    const cartId = await getCartId();

    if (!cartId) {
      return failure("No active cart found");
    }

    let billingAddress: BillingAddressInput;

    if (address) {
      billingAddress = {
        address: {
          ...address,
          save_in_address_book: false,
        },
      };
    } else if (customerAddressId) {
      const numericAddressId = Number(customerAddressId);

      if (!Number.isFinite(numericAddressId)) {
        return failure("Invalid address selected");
      }

      billingAddress = {
        customer_address_id: numericAddressId,
      };
    } else {
      return failure("Either customerAddressId or address must be provided");
    }

    console.info(
      "[setBillingAddressOnCartAction] Setting billing address:",
      customerAddressId ? { customerAddressId } : { address }
    );

    const response = await graphqlRequest<
      SetBillingAddressOnCartResponse,
      SetBillingAddressOnCartVariables
    >({
      authToken,
      query:
        CART_GRAPHQL_MUTATIONS.SET_BILLING_ADDRESS_ON_CART as TypedDocumentString<
          SetBillingAddressOnCartResponse,
          SetBillingAddressOnCartVariables
        >,
      storeCode: getStoreCode(locale),
      variables: {
        billingAddress,
        cartId,
      },
    });

    console.info(
      "[setBillingAddressOnCartAction] Full response:",
      JSON.stringify(response, null, 2)
    );

    if (response.errors?.length) {
      const errorMessage =
        response.errors?.[0]?.message || "Failed to set billing address";
      return failure(errorMessage);
    }

    const cart = response.data?.setBillingAddressOnCart?.cart ?? null;

    console.info("[setBillingAddressOnCartAction] Cart object:", cart);

    const availablePaymentMethods = cart?.available_payment_methods?.filter(
      (method): method is PaymentMethodSummary => Boolean(method)
    );

    console.info(
      "[setBillingAddressOnCartAction] Available payment methods:",
      availablePaymentMethods
    );

    const result = {
      availablePaymentMethods,
    };

    return ok<BillingAddressOnCartResult>(result);
  } catch (error) {
    console.error("Error setting billing address on cart:", error);
    return failure(
      getCommonErrorMessage({
        error,
        fallbackMessage: "Failed to set billing address",
        tCommonErrors,
      })
    );
  }
}
