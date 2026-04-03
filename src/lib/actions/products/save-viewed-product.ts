"use server";

import { updateTag } from "next/cache";

import { getLocale } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getOrSetDeviceIdCookie } from "@/lib/actions/cookies/device-id";
import { getCustomerByAuthToken } from "@/lib/actions/customer/get-customer-by-auth-token";
import { graphqlRequest } from "@/lib/clients/graphql";
import { PRODUCTS_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/products";
import {
  getRecentlyViewedProductsTagByDeviceId,
  getRecentlyViewedProductsTagByMobileNumber,
} from "@/lib/constants/cache/tags";
import { Locale } from "@/lib/constants/i18n";
import { getStoreCode } from "@/lib/utils/country";
import { ok } from "@/lib/utils/service-result";

import type { SaveViewedProductInput } from "@/graphql/graphql";

export async function saveViewedProduct({
  productSku,
}: {
  productSku: string;
}) {
  try {
    if (!productSku) {
      return ok({
        requiresDeviceSync: false,
        saved: false,
      });
    }

    const locale = (await getLocale()) as Locale;
    const authToken = await getAuthToken();
    const resolvedDeviceId = await getOrSetDeviceIdCookie();

    if (!resolvedDeviceId) {
      return ok({
        requiresDeviceSync: true,
        saved: false,
      });
    }

    const input: SaveViewedProductInput = {
      device_id: resolvedDeviceId,
      product_sku: productSku,
    };
    let mobileNumberForCacheTag: null | string = null;

    if (authToken) {
      const currentCustomer = await getCustomerByAuthToken(authToken);
      if (currentCustomer?.phoneNumber) {
        mobileNumberForCacheTag = currentCustomer.phoneNumber.replace(
          /\D/g,
          ""
        );
        input.mobile_number = mobileNumberForCacheTag;
      }

      if (currentCustomer?.email) {
        input.customer_email = currentCustomer.email;
      }
    }

    await graphqlRequest({
      authToken,
      query: PRODUCTS_GRAPHQL_MUTATIONS.SAVE_VIEWED_PRODUCT,
      storeCode: getStoreCode(locale),
      variables: {
        input,
      },
    });

    updateTag(getRecentlyViewedProductsTagByDeviceId(resolvedDeviceId));

    if (mobileNumberForCacheTag) {
      updateTag(
        getRecentlyViewedProductsTagByMobileNumber(mobileNumberForCacheTag)
      );
    }

    return ok({
      requiresDeviceSync: false,
      saved: true,
    });
  } catch (error) {
    console.error("Failed to save viewed product:", error);
    return ok({
      requiresDeviceSync: false,
      saved: false,
    });
  }
}
