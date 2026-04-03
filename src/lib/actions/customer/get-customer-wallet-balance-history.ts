import "server-only";

import { cache } from "react";

import { getLocale } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CUSTOMER_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/customer";
import { Locale } from "@/lib/constants/i18n";
import { WalletTab, WalletTabType } from "@/lib/constants/wallet-tabs";
import { WalletBalanceHistory } from "@/lib/models/wallet-balance-history";
import { failure, ok, unauthenticated } from "@/lib/utils/service-result";

const PAGE_SIZE = 7;

export const getCustomerWalletBalanceHistory = cache(
  async ({
    page = 1,
    tab = WalletTab.All,
  }: {
    page: number;
    tab: WalletTabType;
  }) => {
    const authToken = await getAuthToken();
    const locale = (await getLocale()) as Locale;

    if (!authToken) {
      return unauthenticated();
    }

    try {
      const storeConfig = await getStoreConfig({ locale });

      if (!storeConfig.data?.store) {
        return failure("Failed to fetch customer wallet balance history");
      }

      const response = await graphqlRequest({
        authToken,
        query: CUSTOMER_GRAPHQL_QUERIES.GET_CUSTOMER_REWARD_POINTS_HISTORY,
        storeCode: storeConfig.data.store.code,
      });

      if (!response.data?.customer) {
        return unauthenticated();
      }

      const walletData = new WalletBalanceHistory(response.data);

      // Filter by tab
      const filteredItems = walletData.items.filter((item) => {
        if (tab === WalletTab.All) return true;
        if (tab === WalletTab.Earned) return item.isEarned;
        if (tab === WalletTab.Used) return !item.isEarned;
        return true;
      });

      // Client-side pagination
      const totalItems = filteredItems.length;
      const totalPages = Math.ceil(totalItems / PAGE_SIZE);
      const startIndex = (page - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const paginatedItems = filteredItems.slice(startIndex, endIndex);

      return ok({
        balance: walletData.balance,
        items: paginatedItems,
        pagination: {
          currentPage: page,
          PAGE_SIZE,
          totalItems,
          totalPages,
        },
      });
    } catch (error) {
      console.error("Error fetching customer wallet balance history:", error);
      return failure("Failed to fetch customer wallet balance history");
    }
  }
);
