"use client";

import { ChangeEvent, ClipboardEvent, ComponentProps } from "react";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { cn } from "@/lib/utils";

interface CreditCardCvvInputProps
  extends ComponentProps<typeof FloatingLabelInput> {
  maxLength?: number;
}

export const CreditCardCvvInput = ({
  maxLength = 3,
  ...props
}: CreditCardCvvInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, up to maxLength characters
    const digits = e.target.value.replace(/\D/g, "").slice(0, maxLength);

    if (props.inputProps?.onChange) {
      props.inputProps.onChange({
        target: { value: digits },
      } as unknown as ChangeEvent<HTMLInputElement>);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain") || "";
    const digits = text.replace(/\D/g, "").slice(0, maxLength);

    if (props.inputProps?.onChange) {
      props.inputProps.onChange({
        target: { value: digits },
      } as unknown as ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <FloatingLabelInput
      {...props}
      inputProps={{
        ...props.inputProps,
        autoComplete: "cc-csc",
        className: cn(props.inputProps?.className, "rtl:text-right"),
        dir: "ltr",
        inputMode: "numeric",
        maxLength,
        onChange: handleChange,
        onPaste: handlePaste,
        type: "password",
      }}
    />
  );
};
