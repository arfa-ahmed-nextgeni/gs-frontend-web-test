"use client";

import { useEffect, useImperativeHandle, useMemo } from "react";

import { useLocale, useTranslations } from "next-intl";

import {
  type CheckoutComFramesFieldName,
  type CheckoutComFramesFieldState,
  useCheckoutComFrames,
  type UseCheckoutComFramesOptions,
} from "@/hooks/checkout/use-checkout-com-frames";
import { cn } from "@/lib/utils";

export type CheckoutComCardFieldsHandle = {
  submit: () => Promise<void>;
};

export type CheckoutComCardFieldsResult = {
  bin?: string;
  expiryMonth: number;
  expiryYear: number;
  last4: string;
  scheme?: string;
  token: string;
};

interface CheckoutComCardFieldsProps {
  handleRef?: React.Ref<CheckoutComCardFieldsHandle>;
  isScriptLoaded: boolean;
  onCardTokenized: (result: CheckoutComCardFieldsResult) => void;
  onFieldBlur?: (field: CheckoutComFramesFieldName) => void;
  onFieldFocus?: (field: CheckoutComFramesFieldName) => void;
  onTokenizationFailed: () => void;
  onValidityChange: (isValid: boolean) => void;
  publicKey: string;
  showCvv?: boolean;
}

// Frames.init() requires every configured frame's placeholder div to exist
// in the DOM — omitting one throws "The card frame does not exist in the
// DOM." at runtime (not caught by types). Callers that don't need the CVV
// field (e.g. My Cards page) must render this hidden rather than omit it.
const CVV_OPTIONAL_MODES = ["cvv_optional"];

function CardFieldBlock({
  errorMessage,
  fieldState,
  frameClassName,
  hidden = false,
  id,
  label,
}: {
  errorMessage: string;
  fieldState?: CheckoutComFramesFieldState;
  frameClassName: string;
  hidden?: boolean;
  id: string;
  label: string;
}) {
  const hasError = fieldState?.isValid === false && !fieldState.isEmpty;
  const errorId = `${id}-error`;

  if (hidden) {
    return (
      <div aria-hidden="true" className="sr-only">
        <div className={frameClassName} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-1">
      <label className="text-text-secondary text-sm">{label}</label>
      <div
        aria-describedby={hasError ? errorId : undefined}
        aria-invalid={hasError}
        className={cn(
          "border-border-base bg-bg-surface h-12 w-full rounded-xl border px-3 transition-colors",
          hasError && "border-red-500"
        )}
      >
        <div className={cn(frameClassName, "h-full")} />
      </div>
      {hasError && (
        <span className="text-xs text-red-500" id={errorId} role="alert">
          {errorMessage}
        </span>
      )}
    </div>
  );
}

export const CheckoutComCardFields = ({
  handleRef,
  isScriptLoaded,
  onCardTokenized,
  onFieldBlur,
  onFieldFocus,
  onTokenizationFailed,
  onValidityChange,
  publicKey,
  showCvv = true,
}: CheckoutComCardFieldsProps) => {
  const t = useTranslations("CheckoutPage.addCardDialog");
  const locale = useLocale();
  const isRtl = locale.startsWith("ar");

  const localization: UseCheckoutComFramesOptions["localization"] = useMemo(
    () => ({
      cardNumberPlaceholder: t("cardNumberInput.placeholder"),
      cvvPlaceholder: t("cvvInput.placeholder"),
      expiryMonthPlaceholder: "MM",
      expiryYearPlaceholder: "YY",
    }),
    [t]
  );

  const handleCardTokenized = (event: CheckoutComFramesCardTokenizedEvent) => {
    onCardTokenized({
      bin: event.bin,
      expiryMonth: event.expiry_month,
      expiryYear: event.expiry_year,
      last4: event.last4,
      scheme: event.scheme,
      token: event.token,
    });
  };

  const { fieldStates, isCardValid, submitCard } = useCheckoutComFrames({
    isScriptLoaded,
    localization,
    modes: showCvv ? undefined : CVV_OPTIONAL_MODES,
    onCardTokenizationFailed: onTokenizationFailed,
    onCardTokenized: handleCardTokenized,
    onFrameBlur: onFieldBlur,
    onFrameFocus: onFieldFocus,
    publicKey,
    rtl: isRtl,
  });

  useEffect(() => {
    onValidityChange(isCardValid);
  }, [isCardValid, onValidityChange]);

  useImperativeHandle(
    handleRef,
    () => ({
      submit: submitCard,
    }),
    [submitCard]
  );

  return (
    <div className="flex flex-col gap-6">
      <CardFieldBlock
        errorMessage={t("messages.invalidCardNumber")}
        fieldState={fieldStates["card-number"]}
        frameClassName="card-number-frame"
        id="card-number"
        label={t("cardNumberInput.label")}
      />
      <div className="flex gap-4">
        <CardFieldBlock
          errorMessage={t("messages.invalidDate")}
          fieldState={fieldStates["expiry-date"]}
          frameClassName="expiry-date-frame"
          id="card-expiry"
          label={t("cardExpiryInput.label")}
        />
        <CardFieldBlock
          errorMessage={t("messages.invalidCvv")}
          fieldState={fieldStates.cvv}
          frameClassName="cvv-frame"
          hidden={!showCvv}
          id="cvv"
          label={t("cvvInput.label")}
        />
      </div>
    </div>
  );
};
