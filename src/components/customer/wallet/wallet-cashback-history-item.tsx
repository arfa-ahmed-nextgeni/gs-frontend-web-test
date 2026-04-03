"use client";

import Image from "next/image";

import dayjs from "dayjs";
import { useTranslations } from "next-intl";

import WalletCreditIcon from "@/assets/icons/wallet-credit-icon.svg";
import WalletDebitIcon from "@/assets/icons/wallet-debit-icon.svg";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date";
import { formatPrice } from "@/lib/utils/price";

interface WalletCashbackHistoryItemProps {
  amount: number;
  currency: string;
  date: string;
  expiryDate: null | string;
  isEarned: boolean;
  isNameDisplay: boolean;
  orderId: string;
}

export function WalletCashbackHistoryItem({
  amount,
  currency,
  date,
  expiryDate,
  isEarned,
  isNameDisplay,
  orderId,
}: WalletCashbackHistoryItemProps) {
  const t = useTranslations("WalletPage");

  const isExpired =
    isEarned && expiryDate && dayjs(expiryDate).isBefore(dayjs());

  const dateLabel = isEarned
    ? expiryDate
      ? `${t(isExpired ? "expiredOn" : "expiresOn")} ${formatDate(expiryDate)}`
      : formatDate(date)
    : `${t("usedOn")} ${formatDate(date)}`;

  const orderNumber = orderId
    ? isNameDisplay
      ? orderId
      : t("orderNumber", { orderId })
    : "";

  return (
    <div
      className={cn(
        "bg-bg-default h-12.5 border-border-light flex flex-row items-center justify-between border-b px-5 first:rounded-t-xl last:rounded-b-xl lg:rounded-xl"
      )}
    >
      <div className="flex flex-row items-center gap-2.5">
        <Image
          alt={isEarned ? "earned" : "used"}
          className="size-5"
          height={20}
          src={isEarned ? WalletCreditIcon : WalletDebitIcon}
          width={20}
        />

        <div className="flex flex-col lg:flex-row lg:items-center">
          <p className="text-text-primary min-w-38.5 text-base font-semibold">
            {orderNumber}
          </p>
          <p
            className={cn(
              "text-xs font-normal",
              isExpired ? "text-text-danger" : "text-text-tertiary"
            )}
          >
            {dateLabel}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "text-base font-semibold",
          isEarned ? "text-text-accent" : "text-text-danger"
        )}
        dir="ltr"
      >
        <LocalizedPrice
          currencySymbolProps={{
            className: "inline",
          }}
          price={formatPrice({ amount, currencyCode: currency })}
        />
        <span>{isEarned ? "+" : "-"}</span>
      </div>
    </div>
  );
}
