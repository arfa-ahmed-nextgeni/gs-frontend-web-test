"use client";

import { useTranslations } from "next-intl";

interface CheckoutShippingAddressButtonProps {
  label?: string;
  onClick?: () => void;
}

export function CheckoutShippingAddressButton({
  label,
  onClick,
}: CheckoutShippingAddressButtonProps) {
  const t = useTranslations("CheckoutPage");

  return (
    <button
      className="hover:bg-bg-surface text-text-primary shadow-xs h-[45px] w-full rounded-lg bg-white text-[20px] font-medium"
      onClick={onClick}
      type="button"
    >
      {label ?? t("shippingAddress.addNewAddress")}
    </button>
  );
}
