"use client";

import { ComponentProps } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import Image from "next/image";

import { useTranslations } from "next-intl";

import VerifyIcon from "@/assets/icons/verify.svg";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { useStoreCode } from "@/hooks/i18n/use-store-code";
import { cn } from "@/lib/utils";
import {
  getCountryFlag,
  getMaxPhoneNumberLength,
  isValidPhoneNumber,
} from "@/lib/utils/country";

export const ControlledPhoneNumberField = ({
  disabled,
  floatingLabelInputProps,
  name,
  showVerifyIcon = true,
}: {
  disabled?: boolean;
  floatingLabelInputProps?: ComponentProps<typeof FloatingLabelInput>;
  name: string;
  showVerifyIcon?: boolean;
  success?: boolean;
}) => {
  const formErrorMessages = useTranslations("formErrorMessages");

  const { isGlobal, storeCode } = useStoreCode();

  const {
    control,
    formState: { isSubmitted },
  } = useFormContext();

  const countryCode = useWatch({
    control,
    name: `${name}.countryCode`,
  });

  return (
    <div className="font-gilroy flex flex-row gap-2.5" dir="ltr">
      <Controller
        control={control}
        name={`${name}.countryCode`}
        render={({ field, fieldState }) => {
          const hasError =
            (fieldState.isTouched || isSubmitted) && !!fieldState.error;
          const errorMessage =
            hasError && fieldState.error?.message
              ? formErrorMessages.has(fieldState.error?.message as any)
                ? formErrorMessages(fieldState.error?.message as any)
                : fieldState.error?.message
              : undefined;

          return (
            <div className="flex flex-col gap-2">
              <div
                className={cn(
                  "bg-bg-surface h-12.5 w-29.25 gap-1.25 flex flex-row items-center rounded-xl px-5",
                  {
                    "border-border-danger border": hasError,
                  }
                )}
              >
                <span className="flex h-[20px] w-[30px] items-center">
                  {typeof getCountryFlag(countryCode) === "string" ? (
                    <span className="text-lg">
                      {getCountryFlag(countryCode)}
                    </span>
                  ) : (
                    <Image
                      alt={`${countryCode} flag`}
                      className="h-full w-full object-contain"
                      priority
                      src={getCountryFlag(countryCode)}
                      unoptimized
                    />
                  )}
                </span>
                {isGlobal && !disabled ? (
                  <input
                    {...field}
                    className="text-text-primary w-[60px] bg-white text-lg font-normal outline-none"
                    dir="ltr"
                    inputMode="numeric"
                    onChange={(e) => {
                      let value = e.target.value;
                      // Ensure it starts with + and only contains numbers
                      if (!value.startsWith("+")) {
                        value = "+" + value.replace(/[^0-9]/g, "");
                      } else {
                        value = "+" + value.slice(1).replace(/[^0-9]/g, "");
                      }
                      // Limit country code: + plus 1-3 digits (total length 2-4)
                      if (value.length >= 2 && value.length <= 4) {
                        field.onChange(value);
                      } else if (value === "+") {
                        field.onChange(value);
                      }
                    }}
                    placeholder="+1"
                    type="text"
                  />
                ) : (
                  <span
                    className="text-text-placeholder text-lg font-normal"
                    dir="ltr"
                  >
                    {countryCode}
                  </span>
                )}
              </div>
              {errorMessage && (
                <p className="text-text-danger text-end text-xs font-normal">
                  {errorMessage}
                </p>
              )}
            </div>
          );
        }}
      />

      <Controller
        control={control}
        name={`${name}.number`}
        render={({ field, fieldState }) => {
          const hasError =
            (fieldState.isTouched || isSubmitted) && !!fieldState.error;
          const errorMessage =
            hasError && fieldState.error?.message
              ? formErrorMessages.has(fieldState.error?.message as any)
                ? formErrorMessages(fieldState.error?.message as any)
                : fieldState.error?.message
              : undefined;

          let formattedNumber = field.value || "";
          if (field.value && field.value.length > 0) {
            if (field.value.length <= 2) {
              formattedNumber = field.value;
            } else if (field.value.length <= 5) {
              formattedNumber = `${field.value.slice(0, 2)} ${field.value.slice(2)}`;
            } else {
              formattedNumber = `${field.value.slice(0, 2)} ${field.value.slice(2, 5)} ${field.value.slice(5)}`;
            }
          }

          const phoneNumberValue = field.value?.replace(/\s+/g, "") || "";
          const isValid =
            phoneNumberValue.length > 0 &&
            isValidPhoneNumber(phoneNumberValue, countryCode, storeCode) &&
            !hasError;

          return (
            <div className="relative flex-1">
              <FloatingLabelInput
                {...floatingLabelInputProps}
                containerProps={{
                  className: "flex-1",
                }}
                error={hasError}
                helperText={errorMessage}
                iconContainerProps={{
                  className: "rtl:!right-5 rtl:end-auto",
                }}
                inputProps={{
                  ...field,
                  disabled: disabled,
                  inputMode: "numeric",
                  onChange: (e) => {
                    if (!field?.onChange) return;
                    const numericValue = e.target.value.replace(/[^0-9]/g, "");
                    const maxLength = getMaxPhoneNumberLength(
                      countryCode,
                      storeCode
                    );
                    const limitedValue = numericValue.slice(0, maxLength);
                    field.onChange(limitedValue);
                  },
                  onKeyPress: (e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  },
                  onPaste: (e) => {
                    e.preventDefault();
                    if (!field?.onChange) return;
                    const pastedText = e.clipboardData.getData("text");
                    const numericValue = pastedText.replace(/[^0-9]/g, "");
                    const maxLength = getMaxPhoneNumberLength(
                      countryCode,
                      storeCode
                    );
                    const limitedValue = numericValue.slice(0, maxLength);
                    field.onChange(limitedValue);
                  },
                  value: formattedNumber,
                  ...floatingLabelInputProps?.inputProps,
                }}
              />
              {isValid && showVerifyIcon && (
                <div
                  className={cn(
                    "pointer-events-none absolute end-5 top-[1.375rem] z-10",
                    "rtl:!right-5 rtl:end-auto"
                  )}
                >
                  <Image
                    alt="verified"
                    height={12}
                    src={VerifyIcon}
                    unoptimized
                    width={12}
                  />
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};
