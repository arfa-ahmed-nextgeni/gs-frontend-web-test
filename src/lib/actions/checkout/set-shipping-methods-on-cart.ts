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

type SetShippingMethodsOnCartResult = {
  cart: {
    prices?: {
      applied_taxes?: Array<{
        amount: {
          currency: string;
          value: number;
        };
        label: string;
      }>;
      discount?: {
        amount: {
          currency: string;
          value: number;
        };
        label: string;
      };
      discounts?: Array<{
        amount: {
          currency: string;
          value: number;
        };
        applied_to: string;
        label: string;
      }>;
      grand_total?: {
        currency: string;
        value: number;
      };
      subtotal_excluding_tax?: {
        currency: string;
        value: number;
      };
      subtotal_including_tax?: {
        currency: string;
        value: number;
      };
      subtotal_with_discount_excluding_tax?: {
        currency: string;
        value: number;
      };
    };
    selected_payment_method?: {
      code: string;
      purchase_order_number?: string;
      title: string;
    };
    shipping_addresses?: Array<{
      selected_shipping_method?: {
        amount?: {
          currency: string;
          value: number;
        };
        base_amount?: {
          currency: string;
          value: number;
        };
        carrier_code: string;
        method_code: string;
        price_excl_tax?: {
          currency: string;
          value: number;
        };
        price_incl_tax?: {
          currency: string;
          value: number;
        };
      };
    }>;
    total_quantity?: number;
  };
};

export async function setShippingMethodsOnCartAction({
  carrierCode,
  methodCode,
}: {
  carrierCode: string;
  methodCode: string;
}) {
  const tCommonErrors = await getTranslations("CommonErrors");
  try {
    const authToken = await getAuthToken();
    const locale = (await getLocale()) as Locale;
    const cartId = await getCartId();

    if (!cartId) {
      return failure("No active cart found");
    }

    if (!carrierCode || !methodCode) {
      return failure("Carrier code and method code are required");
    }

    const response: any = await graphqlRequest<any, any>({
      authToken,
      query: CART_GRAPHQL_MUTATIONS.SET_SHIPPING_METHODS_ON_CART,
      storeCode: getStoreCode(locale),
      variables: {
        input: {
          cart_id: cartId,
          shipping_methods: [
            {
              carrier_code: carrierCode,
              method_code: methodCode,
            },
          ],
        },
      } as any,
    });

    if (response.errors?.length) {
      const errorMessage =
        response.errors?.[0]?.message || "Failed to set shipping method";
      return failure(errorMessage);
    }

    const cart = response.data?.setShippingMethodsOnCart?.cart ?? null;

    if (!cart) {
      return failure("Failed to set shipping method");
    }

    const result = {
      cart,
    };

    return ok<SetShippingMethodsOnCartResult>(result);
  } catch (error) {
    console.error("Error setting shipping methods on cart:", error);
    return failure(
      getCommonErrorMessage({
        error,
        fallbackMessage: "Failed to set shipping method",
        tCommonErrors,
      })
    );
  }
}
