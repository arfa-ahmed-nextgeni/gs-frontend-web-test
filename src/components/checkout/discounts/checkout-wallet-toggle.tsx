"use client";

import { useState } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import RiyalIcon from "@/assets/icons/riyal-icon.svg";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { useStoreConfig } from "@/contexts/store-config-context";

interface CheckoutWalletToggleProps {
  balance: number;
  onToggle?: (isEnabled: boolean) => void;
}

export function CheckoutWalletToggle({
  balance,
  onToggle,
}: CheckoutWalletToggleProps) {
  const t = useTranslations("CheckoutPage.discounts");
  const { storeConfig } = useStoreConfig();
  const [isEnabled, setIsEnabled] = useState(false);
  const currencyCode = storeConfig?.currencyCode || "SAR";

  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    onToggle?.(newState);
  };

  return (
    <div
      className="hover:bg-bg-surface shadow-xs flex cursor-pointer items-center justify-between rounded-b-lg bg-white px-4 py-3 text-sm"
      onClick={handleToggle}
    >
      <span className="flex items-center gap-2 text-[15px] font-normal">
        <Image alt="wallet" className="h-5 w-5" src={RiyalIcon} />
        <span className="inline-flex items-center">
          {t("useWallet")}
          <LocalizedPrice
            containerProps={{
              className: "ml-1 inline-flex items-center",
            }}
            price={`${balance} ${currencyCode}`}
            valueProps={{
              className: "mr-0.5 font-semibold",
            }}
          />
          {t("fromWallet")}
        </span>
      </span>
      <span className="relative inline-flex h-5 w-10 items-center rounded-full bg-gray-200">
        <span
          className={`absolute ${
            isEnabled ? "left-5" : "left-0.5"
          } inline-block h-4 w-4 translate-x-0 rounded-full bg-white shadow transition`}
        />
      </span>
    </div>
  );
}
