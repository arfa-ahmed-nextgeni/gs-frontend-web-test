export const enum WalletTab {
  All = "all",
  Earned = "earned",
  Used = "used",
}

export const WALLET_TABS = [
  WalletTab.All,
  WalletTab.Earned,
  WalletTab.Used,
] as const;

export type WalletTabType = (typeof WALLET_TABS)[number];
