"use client";

import { ReactNode } from "react";

import { useTranslations } from "next-intl";

import { Spinner } from "@/components/ui/spinner";

interface CheckoutStickyFooterProps {
  buttonText?: ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  variant?: "applePay" | "default" | "primary";
}

export function CheckoutStickyFooter({
  buttonText,
  disabled = false,
  isLoading = false,
  onClick,
  variant = "default",
}: CheckoutStickyFooterProps) {
  const t = useTranslations("CheckoutPage");

  const buttonClassName =
    variant === "primary"
      ? "flex h-[50px] w-full max-w-[390px] items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-8 text-[20px] font-medium text-white hover:bg-[#3B82F6]/90 disabled:cursor-not-allowed disabled:opacity-50 lg:w-[390px]"
      : variant === "applePay"
        ? "apple-pay-button-styled h-[50px] min-h-[44px] w-full max-w-[390px] rounded-xl border-0 p-0 text-[0] leading-none text-transparent disabled:cursor-not-allowed disabled:opacity-50 [&>*]:hidden lg:w-[390px]"
        : "flex h-[50px] w-full max-w-[390px] items-center justify-center gap-2 rounded-xl bg-[#3F4852] px-8 text-[20px] font-medium text-white hover:bg-[#3F4852]/90 disabled:cursor-not-allowed disabled:opacity-50 lg:w-[390px]";

  return (
    <div className="bottom-15 fixed inset-x-0 z-10 bg-white lg:bottom-0">
      <div className="mx-auto flex w-full max-w-[1440px] justify-center px-4 py-4 lg:justify-end">
        <button
          aria-label={
            variant === "applePay"
              ? buttonText?.toString() || t("button.pay")
              : undefined
          }
          className={buttonClassName}
          disabled={disabled || isLoading}
          onClick={onClick}
        >
          {/* For Apple Pay button, content is hidden by CSS - Apple's native styling shows the logo */}
          {/* For other buttons, show spinner and text normally */}
          {variant !== "applePay" && (
            <>
              {isLoading && <Spinner size={20} variant="light" />}
              {buttonText || t("button.selectAddress")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
