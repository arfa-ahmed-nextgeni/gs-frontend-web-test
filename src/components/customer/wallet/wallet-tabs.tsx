"use client";

import { useTranslations } from "next-intl";

import { useWalletTab } from "@/hooks/wallet/use-wallet-tab";
import { WALLET_TABS, WalletTab } from "@/lib/constants/wallet-tabs";
import { cn } from "@/lib/utils";

export function WalletTabs() {
  const t = useTranslations("WalletPage");

  const { activeTab, isLoading, setActiveTab } = useWalletTab();

  return (
    <div className="mt-5 flex flex-row justify-between gap-2.5">
      {WALLET_TABS.map((tab) => {
        const isActive = activeTab === tab;

        return (
          <button
            className={cn(
              "h-12.5 transition-default flex items-center justify-center rounded-xl text-center text-base font-medium lg:flex-1 lg:text-xl",
              isActive
                ? "bg-btn-bg-primary text-text-ghost font-medium"
                : "bg-bg-default text-text-primary font-normal",
              tab === WalletTab.All ? "flex-1/3" : "flex-1/2"
            )}
            disabled={isLoading}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {t(`tabs.${tab}`)}
          </button>
        );
      })}
    </div>
  );
}
