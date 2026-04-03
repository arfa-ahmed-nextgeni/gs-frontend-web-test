import { AsyncBoundary } from "@/components/common/async-boundary";
import { WalletBalanceCard } from "@/components/customer/wallet-balance-card";
import { WalletCashbackHistorySkeleton } from "@/components/customer/wallet/skeletons/wallet-cashback-history-skeleton";
import { WalletTabsSkeleton } from "@/components/customer/wallet/skeletons/wallet-tabs-skeleton";
import { WalletCashbackHistory } from "@/components/customer/wallet/wallet-cashback-history";
import { WalletCashbackHistoryTitle } from "@/components/customer/wallet/wallet-cashback-history-title";
import { WalletFooterLinks } from "@/components/customer/wallet/wallet-footer-links";
import { WalletInfoBanner } from "@/components/customer/wallet/wallet-info-banner";
import { WalletTabs } from "@/components/customer/wallet/wallet-tabs";
import { CurrencyEnum } from "@/graphql/graphql";
import { WalletTabType } from "@/lib/constants/wallet-tabs";

interface WalletPageContentProps {
  balance?: {
    currency?: CurrencyEnum | null;
    value?: null | number;
  };
  page: number;
  tab: WalletTabType;
}

export function WalletPageContent({
  balance,
  page,
  tab,
}: WalletPageContentProps) {
  return (
    <div className="lg:mt-12.5 pb-13 flex flex-col">
      <WalletBalanceCard
        balance={balance}
        containerProps={{ className: "rounded-none lg:hidden" }}
        disableNavigation
      />

      <div className="mt-3 flex flex-col px-5 lg:mt-0 lg:px-0">
        <WalletInfoBanner />

        <WalletCashbackHistoryTitle />

        <AsyncBoundary fallback={<WalletTabsSkeleton />}>
          <WalletTabs />
        </AsyncBoundary>
      </div>

      <AsyncBoundary
        fallback={<WalletCashbackHistorySkeleton />}
        key={`${page}-${tab}`}
      >
        <WalletCashbackHistory page={page} tab={tab} />
      </AsyncBoundary>

      <WalletFooterLinks />
    </div>
  );
}
