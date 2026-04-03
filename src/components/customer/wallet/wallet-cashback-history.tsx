import { unauthorized } from "next/navigation";

import { PaginationWithSearchParams } from "@/components/shared/pagination-with-search-params";
import { getCustomerWalletBalanceHistory } from "@/lib/actions/customer/get-customer-wallet-balance-history";
import { WalletTabType } from "@/lib/constants/wallet-tabs";
import { isUnauthenticated } from "@/lib/utils/service-result";

import { WalletCashbackHistoryItem } from "./wallet-cashback-history-item";

interface WalletCashbackHistoryProps {
  page: number;
  tab: WalletTabType;
}

export async function WalletCashbackHistory({
  page,
  tab,
}: WalletCashbackHistoryProps) {
  const walletData = await getCustomerWalletBalanceHistory({ page, tab });

  if (isUnauthenticated(walletData)) {
    unauthorized();
  }

  const items = walletData.data?.items ?? [];
  const pagination = walletData.data?.pagination;

  return (
    <>
      <div className="mt-7.5 flex flex-col">
        {items.map((item) => (
          <WalletCashbackHistoryItem
            amount={item.amount}
            currency={item.currency}
            date={item.date}
            expiryDate={item.expiryDate}
            isEarned={item.isEarned}
            isNameDisplay={item.isNameDisplay}
            key={item.id}
            orderId={item.displayOrderId}
          />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <PaginationWithSearchParams
          containerProps={{ className: "mt-21.25" }}
          queryOptions={{ scroll: true }}
          totalPages={pagination.totalPages}
        />
      )}
    </>
  );
}
