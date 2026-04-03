"use client";

import {
  ChangeEvent,
  ClipboardEvent,
  ComponentProps,
  useMemo,
  useRef,
} from "react";

import Image from "next/image";

import cardValidator from "card-validator";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { PAYMENT_CARD_NETWORK_ICONS } from "@/lib/constants/payment-card";
import { PaymentCardNetwork } from "@/lib/constants/payment-card";
import { cn } from "@/lib/utils";
import { assignRef, caretPosFromDigitsCount } from "@/lib/utils/dom";
import {
  detectPaymentCardNetwork,
  formatPaymentCardNumber,
  normalizePaymentCardNumber,
} from "@/lib/utils/payment-card";

export const CreditCardNumberInput = (
  props: ComponentProps<typeof FloatingLabelInput>
) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleNode = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    assignRef((props as any).ref, node);
    assignRef((props.inputProps as any)?.ref, node);
  };

  const cardNumber = props.inputProps?.value?.toString() || "";
  const normalizedCardNumber = normalizePaymentCardNumber(cardNumber);
  const cardNetwork = useMemo(() => {
    if (normalizedCardNumber.length >= 4) {
      return detectPaymentCardNetwork(normalizedCardNumber);
    }
    return PaymentCardNetwork.Unknown;
  }, [normalizedCardNumber]);

  const isCardValid = useMemo(() => {
    if (normalizedCardNumber.length < 13) return false;
    const validation = cardValidator.number(normalizedCardNumber);
    return validation.isValid;
  }, [normalizedCardNumber]);

  const cardIcon =
    cardNetwork !== PaymentCardNetwork.Unknown
      ? PAYMENT_CARD_NETWORK_ICONS[cardNetwork]
      : null;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const el = inputRef.current ?? e.target;

    const prevValue = (e.target as HTMLInputElement).value;
    const prevSelectionStart = el.selectionStart ?? prevValue.length;
    const prevDigitsBefore = normalizePaymentCardNumber(
      prevValue.slice(0, prevSelectionStart)
    ).length;

    const raw = normalizePaymentCardNumber(e.target.value);
    const formatted = formatPaymentCardNumber(raw);

    if (props.inputProps?.onChange) {
      props.inputProps.onChange({
        ...e,
        currentTarget: { ...e.currentTarget, value: formatted },
        target: { ...e.target, value: formatted },
      } as unknown as ChangeEvent<HTMLInputElement>);
    }

    window.requestAnimationFrame(() => {
      const nextPos = caretPosFromDigitsCount(formatted, prevDigitsBefore);
      try {
        (inputRef.current ?? e.target).setSelectionRange(nextPos, nextPos);
      } catch {}
    });
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const text = e.clipboardData.getData("text/plain") || "";
    const digits = normalizePaymentCardNumber(text);
    const formatted = formatPaymentCardNumber(digits);

    if (props.inputProps?.onChange) {
      props.inputProps.onChange({
        target: { value: formatted },
      } as unknown as ChangeEvent<HTMLInputElement>);
    }

    window.requestAnimationFrame(() => {
      try {
        inputRef.current?.setSelectionRange(formatted.length, formatted.length);
      } catch {}
    });
  };

  return (
    <FloatingLabelInput
      {...props}
      iconContainerProps={
        cardIcon || isCardValid
          ? {
              ...props.iconContainerProps,
              children: cardIcon ? (
                <Image
                  alt={cardNetwork}
                  className="h-3 w-auto"
                  src={cardIcon}
                  unoptimized
                />
              ) : null,
              className: cn("end-10 z-10", props.iconContainerProps?.className),
            }
          : props.iconContainerProps
      }
      inputProps={{
        ...props.inputProps,
        autoComplete: "cc-number",
        className: cn(
          props.inputProps?.className,
          "rtl:text-right",
          (cardIcon || isCardValid) && "pr-24 rtl:pr-5"
        ),
        dir: "ltr",
        inputMode: "numeric",
        maxLength: 19,
        onChange: handleChange,
        onPaste: handlePaste,
        ref: handleNode,
        type: "text",
      }}
    />
  );
};
