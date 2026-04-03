import { WalletCashbackHistoryItemSkeleton } from "@/components/customer/wallet/skeletons/wallet-cashback-history-item-skeleton";

export function WalletCashbackHistorySkeleton() {
  return (
    <div className="mt-7.5 flex flex-col">
      {[...Array(5)].map((_, index) => (
        <WalletCashbackHistoryItemSkeleton key={index} />
      ))}
    </div>
  );
}
