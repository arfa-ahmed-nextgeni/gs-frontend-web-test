"use client";

import Image from "next/image";

import { useTranslations } from "next-intl";

interface CheckoutPaymentOptionProps {
  icon: string;
  isSelected: boolean;
  onChange: () => void;
  primary: string;
  secondary?: null | React.ReactNode | string;
  secondaryPrice?: null | string;
  value: string;
}

export function CheckoutPaymentOption({
  icon,
  isSelected,
  onChange,
  primary,
  secondary,
  secondaryPrice,
  value,
}: CheckoutPaymentOptionProps) {
  const t = useTranslations("CheckoutPage");

  const displayPrimary = (() => {
    if (value === "tabby_installments") return t("payment.tabby");
    if (value === "pay_by_instalments") return t("payment.tamara");
    return primary;
  })();

  return (
    <label className="flex cursor-pointer items-center justify-between px-4 py-3">
      <span className="text-text-primary flex items-center gap-2 text-sm lg:gap-3">
        <Image alt="method" className="h-5 w-5 shrink-0" src={icon} />
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 lg:gap-x-3">
          <span className="text-text-primary text-[15px] font-medium">
            {displayPrimary}
          </span>
          {secondary && (
            <span className="inline-flex items-center gap-1 text-[12px] text-[#85878A]">
              {typeof secondary === "string" && secondaryPrice
                ? secondary.split(secondaryPrice)[0]
                : null}
              {typeof secondary === "string" && secondaryPrice && (
                <span className="inline-flex items-center">
                  <span className="font-saudi-riyal relative leading-none">
                    &#xE900;
                  </span>
                  {secondaryPrice}
                </span>
              )}
              {typeof secondary === "string" && secondaryPrice
                ? secondary.split(secondaryPrice)[1]
                : secondary}
            </span>
          )}
        </span>
      </span>
      <input
        checked={isSelected}
        className="sr-only"
        name="payment"
        onChange={onChange}
        type="radio"
        value={value}
      />
      <span
        className={`relative inline-flex size-5 items-center justify-center rounded-full ${
          isSelected
            ? "border-[2.5px] border-[#5D5D5D]"
            : "border border-[#5D5D5D]"
        }`}
      >
        {isSelected && (
          <>
            <span className="absolute size-3.5 rounded-full border-[1.5px] border-[#E5E7EB] bg-white" />
            <span className="absolute size-3 rounded-full bg-[#6543F5]" />
          </>
        )}
      </span>
    </label>
  );
}
