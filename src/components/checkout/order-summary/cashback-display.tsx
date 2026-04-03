"use client";

import { useTranslations } from "next-intl";

import { LocalizedPrice } from "@/components/shared/localized-price";
import { useStoreConfig } from "@/contexts/store-config-context";
import { formatPrice } from "@/lib/utils/price";

export function CashbackDisplay({
  currencyCode,
  grandTotal,
}: {
  currencyCode: string;
  grandTotal: number;
}) {
  const t = useTranslations("CheckoutPage.orderSummary");
  const { storeConfig } = useStoreConfig();
  const cashbackPercent = storeConfig?.cashbackPercent || 0.05;
  const cashbackAmount = grandTotal * cashbackPercent;

  if (cashbackAmount <= 0) return null;

  return (
    <div className="flex items-center justify-between pt-2">
      <span className="text-text-tertiary text-sm font-medium">
        {t("cashback")}
      </span>
      <LocalizedPrice
        containerProps={{
          className: "inline-flex items-center text-text-teal",
        }}
        price={formatPrice({ amount: cashbackAmount, currencyCode })}
      />
    </div>
  );
}
