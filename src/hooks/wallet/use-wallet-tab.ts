import { useTransition } from "react";

import { parseAsInteger, parseAsStringLiteral, useQueryStates } from "nuqs";

import { QueryParamsKey } from "@/lib/constants/query-params";
import {
  WALLET_TABS,
  WalletTab,
  WalletTabType,
} from "@/lib/constants/wallet-tabs";

export function useWalletTab() {
  const [isLoading, startTransition] = useTransition();

  const [{ tab }, setQueryStates] = useQueryStates(
    {
      [QueryParamsKey.Page]: parseAsInteger.withDefault(1),
      [QueryParamsKey.Tab]: parseAsStringLiteral(WALLET_TABS).withDefault(
        WalletTab.All
      ),
    },
    {
      shallow: false,
      startTransition,
    }
  );

  const setActiveTab = (newTab: WalletTabType) => {
    setQueryStates({
      [QueryParamsKey.Page]: 1,
      [QueryParamsKey.Tab]: newTab,
    });
  };

  return {
    activeTab: tab,
    isLoading,
    setActiveTab,
  };
}
