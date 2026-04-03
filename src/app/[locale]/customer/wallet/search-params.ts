import {
  createLoader,
  parseAsInteger,
  parseAsStringLiteral,
} from "nuqs/server";

import { WALLET_TABS, WalletTab } from "@/lib/constants/wallet-tabs";

export const walletSearchParams = {
  page: parseAsInteger.withDefault(1),
  tab: parseAsStringLiteral(WALLET_TABS).withDefault(WalletTab.All),
};

export const loadWalletSearchParams = createLoader(walletSearchParams);
