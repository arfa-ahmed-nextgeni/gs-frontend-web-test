"use client";

import { ChangeEvent, ClipboardEvent, ComponentProps } from "react";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { cn } from "@/lib/utils";
import { formatPaymentCardExpiryDate } from "@/lib/utils/payment-card";

export const CreditCardExpiryInput = (
  props: ComponentProps<typeof FloatingLabelInput>
) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPaymentCardExpiryDate(e.target.value);

    if (props.inputProps?.onChange) {
      props.inputProps.onChange({
        target: { value: formatted },
      } as unknown as ChangeEvent<HTMLInputElement>);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain") || "";
    const formatted = formatPaymentCardExpiryDate(text);

    if (props.inputProps?.onChange) {
      props.inputProps.onChange({
        target: { value: formatted },
      } as unknown as ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <FloatingLabelInput
      {...props}
      inputProps={{
        ...props.inputProps,
        autoComplete: "cc-exp",
        className: cn(props.inputProps?.className, "rtl:text-right"),
        dir: "ltr",
        inputMode: "numeric",
        maxLength: 5, // "MM/YY"
        onChange: handleChange,
        onPaste: handlePaste,
        type: "text",
      }}
    />
  );
};
