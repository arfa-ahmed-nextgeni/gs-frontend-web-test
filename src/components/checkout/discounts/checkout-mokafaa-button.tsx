"use client";

import { useState } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import CloseIcon from "@/assets/icons/close-icon.svg";
import PlusIcon from "@/assets/icons/plus-icon.svg";
import VectorIcon from "@/assets/icons/vector-icon.svg";
import { RotatingIcon } from "@/components/cart/order/order-summary/order-summary-helpers";

interface CheckoutMokafaaButtonProps {
  amount: number;
  onToggle?: (isApplied: boolean) => void;
}

export function CheckoutMokafaaButton({
  amount,
  onToggle,
}: CheckoutMokafaaButtonProps) {
  const t = useTranslations("CartPage.orderSummary.actions");
  const [isApplied, setIsApplied] = useState(false);

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
                <span className="inline-flex items-center">
                  <span
                    className="font-saudi-riyal relative ml-1 leading-none"
                    dir="ltr"
                  >
                    &#xE900;
                  </span>
                  <span className="mr-0.5 font-semibold">{amount}</span>
                </span>
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
