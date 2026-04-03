"use server";

import { unauthorized } from "next/navigation";

import { getLocale, getTranslations } from "next-intl/server";

import { ShippingAddressInput } from "@/graphql/graphql";
import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { getCartId } from "@/lib/actions/cookies/cart";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CART_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/cart";
import { LockerType } from "@/lib/constants/checkout/locker-locations";
import { Locale, StoreCode } from "@/lib/constants/i18n";
import { failure, ok } from "@/lib/utils/service-result";

export const addLockerAddressOnCart = async (
  data: ShippingAddressInput,
  lockerType: LockerType,
  lockerId: string
) => {
  const t = await getTranslations("AddPickupPointPage.messages");

  const locale = (await getLocale()) as Locale;

  const authToken = await getAuthToken();
  const cartId = await getCartId();

  if (!authToken || !cartId) {
    unauthorized();
  }

  try {
    const storeConfig = await getStoreConfig({ locale });

    const setShippingAddressResponse = await graphqlRequest({
      authToken,
      query: CART_GRAPHQL_MUTATIONS.SET_SHIPPING_ADDRESSES_ON_CART,
      storeCode: storeConfig.data?.store?.code as StoreCode,
      variables: {
        cartId,
        shippingAddresses: [data],
      },
    });

    if (
      (setShippingAddressResponse.errors &&
        setShippingAddressResponse.errors.length > 0) ||
      !setShippingAddressResponse.data
    ) {
      const errorMessage =
        setShippingAddressResponse?.errors?.[0]?.message ||
        t("failedToAddLockerAddressToCart");

      return failure(errorMessage);
    }

    const setBillingAddressResponse = await graphqlRequest({
      authToken,
      query: CART_GRAPHQL_MUTATIONS.SET_BILLING_ADDRESS_ON_CART,
      storeCode: storeConfig.data?.store?.code as StoreCode,
      variables: {
        billingAddress: {
          same_as_shipping: true,
        },
        cartId,
      },
    });

    if (
      (setBillingAddressResponse.errors &&
        setBillingAddressResponse.errors.length > 0) ||
      !setBillingAddressResponse.data
    ) {
      const errorMessage =
        setBillingAddressResponse?.errors?.[0]?.message ||
        t("failedToAddLockerAddressToCart");

      return failure(errorMessage);
    }

    const carrierCode =
      lockerType === LockerType.Redbox
        ? "lambdashipping_redboxlocker"
        : "lambdashipping_fodellocker";
    const methodCode =
      lockerType === LockerType.Redbox ? "redboxlocker" : "fodellocker";

    const pickupPoint =
      lockerType === LockerType.Redbox
        ? {
            pickup: "1",
            pickup_point_id: lockerId,
          }
        : {
            collection_point_id: lockerId,
            fodel_pickup: "1",
          };

    const setShippingMethodsResponse = await graphqlRequest({
      authToken,
      query: CART_GRAPHQL_MUTATIONS.SET_SHIPPING_METHODS_ON_CART,
      storeCode: storeConfig.data?.store?.code as StoreCode,
      variables: {
        input: {
          cart_id: cartId,
          shipping_methods: [
            {
              carrier_code: carrierCode,
              method_code: methodCode,
              pickup_point: pickupPoint,
            },
          ],
        },
      },
    });

    if (
      (setShippingMethodsResponse.errors &&
        setShippingMethodsResponse.errors.length > 0) ||
      !setShippingMethodsResponse.data
    ) {
      const errorMessage =
        setShippingMethodsResponse?.errors?.[0]?.message ||
        t("failedToAddLockerAddressToCart");

      return failure(errorMessage);
    }

    return ok(t("lockerAddressAddedSuccessfully"));
  } catch (error) {
    console.error("Error adding locker address to cart:", error);

    return failure(t("failedToAddLockerAddressToCart"));
  }
};
