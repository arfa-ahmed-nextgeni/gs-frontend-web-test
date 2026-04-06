"use client";

import { useState } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import CloseIcon from "@/assets/icons/close-icon.svg";
import PlusIcon from "@/assets/icons/plus-icon.svg";
import VectorIcon from "@/assets/icons/vector-icon.svg";
import { RotatingIcon } from "@/components/cart/order/order-summary/order-summary-helpers";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { useStoreConfig } from "@/contexts/store-config-context";

interface CheckoutMokafaaButtonProps {
  amount: number;
  onToggle?: (isApplied: boolean) => void;
}

export function CheckoutMokafaaButton({
  amount,
  onToggle,
}: CheckoutMokafaaButtonProps) {
  const t = useTranslations("CartPage.orderSummary.actions");
  const { storeConfig } = useStoreConfig();
  const [isApplied, setIsApplied] = useState(false);
  const currencyCode = storeConfig?.currencyCode || "SAR";

  const handleClick = () => {
    const newState = !isApplied;
    setIsApplied(newState);
    onToggle?.(newState);
  };

  return (
    <button
      className="hover:bg-bg-surface shadow-xs flex items-center justify-between bg-white px-4 py-3 text-sm"
      onClick={handleClick}
      type="button"
    >
      <span className="flex items-center gap-2 text-[15px] font-normal">
        <Image alt="points" className="h-5 w-5" src={VectorIcon} />
        {isApplied ? (
          <span>
            {t.rich("mokafaaUsed", {
              amount: () => (
                <LocalizedPrice
                  containerProps={{
                    className: "ml-1 inline-flex items-center",
                  }}
                  price={`${amount} ${currencyCode}`}
                  valueProps={{
                    className: "mr-0.5 font-semibold",
                  }}
                />
              ),
              b: (chunks) => (
                <span className="text-btn-bg-teal font-medium">{chunks}</span>
              ),
            })}
          </span>
        ) : (
          <span>
            {t.rich("redeemMokafaa", {
              b: (chunks) => (
                <span className="font-semibold rtl:font-bold">{chunks}</span>
              ),
            })}
          </span>
        )}
      </span>
      <RotatingIcon
        active={isApplied}
        activeSrc={CloseIcon}
        inactiveSrc={PlusIcon}
        size={20}
      />
    </button>
  );
}
