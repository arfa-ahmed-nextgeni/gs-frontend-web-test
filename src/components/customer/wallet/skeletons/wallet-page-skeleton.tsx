import { WalletBalanceCardSkeleton } from "@/components/customer/wallet/skeletons/wallet-balance-card-skeleton";
import { WalletCashbackHistorySkeleton } from "@/components/customer/wallet/skeletons/wallet-cashback-history-skeleton";
import { WalletCashbackHistoryTitleSkeleton } from "@/components/customer/wallet/skeletons/wallet-cashback-history-title-skeleton";
import { WalletFooterLinksSkeleton } from "@/components/customer/wallet/skeletons/wallet-footer-links-skeleton";
import { WalletInfoBannerSkeleton } from "@/components/customer/wallet/skeletons/wallet-info-banner-skeleton";
import { WalletTabsSkeleton } from "@/components/customer/wallet/skeletons/wallet-tabs-skeleton";

export function WalletPageSkeleton() {
  return (
    <div className="lg:mt-12.5 pb-13 flex flex-col">
      <WalletBalanceCardSkeleton />

      <div className="mt-3 flex flex-col px-5 lg:mt-0 lg:px-0">
        <WalletInfoBannerSkeleton />

        <WalletCashbackHistoryTitleSkeleton />

        <WalletTabsSkeleton />
      </div>

      <WalletCashbackHistorySkeleton />

      <WalletFooterLinksSkeleton />
    </div>
  );
}
