"use client";

import type { CountryCallingCode, NationalNumber } from "libphonenumber-js";

import { ComponentProps, useEffect, useState } from "react";

import Image from "next/image";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { useStoreCode } from "@/hooks/i18n/use-store-code";
import {
  getCountryFlag,
  getDefaultCountryCode,
  getMaxPhoneNumberLength,
} from "@/lib/utils/country";

export const PhoneNumberInput = ({
  disabled,
  error,
  floatingLabelInputProps,
  name,
  onChange,
  success,
  value,
}: {
  disabled?: boolean;
  error?: boolean;
  floatingLabelInputProps?: ComponentProps<typeof FloatingLabelInput>;
  name: string;
  onChange: (value: { countryCode: string; number: string }) => void;
  success?: boolean;
  value: {
    countryCode: CountryCallingCode | string;
    number: NationalNumber | string;
  };
}) => {
  const { isGlobal, storeCode } = useStoreCode();

  const [phoneNumber, setPhoneNumber] = useState({
    countryCode: value.countryCode || getDefaultCountryCode(storeCode),
    number: value.number || "",
  });

  // Whenever phoneNumber changes, notify parent
  useEffect(() => {
    onChange(phoneNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneNumber]);

  const { countryCode, number } = phoneNumber;

  // Format number visually as user types: "05 123 4567"
  let formattedNumber = number;
  if (number.length > 0) {
    if (number.length <= 2) {
      formattedNumber = number;
    } else if (number.length <= 5) {
      formattedNumber = `${number.slice(0, 2)} ${number.slice(2)}`;
    } else {
      formattedNumber = `${number.slice(0, 2)} ${number.slice(
        2,
        5
      )} ${number.slice(5)}`;
    }
  }

  return (
    <div className="flex flex-row gap-2.5" dir="ltr">
      {/* Country Code Field */}
      <div className="bg-bg-surface w-29.25 py-2.75 flex flex-row items-center gap-1 rounded-xl px-5">
        <span className="flex h-[20px] w-[30px] items-center">
          {typeof getCountryFlag(countryCode) === "string" ? (
            <span className="text-lg">{getCountryFlag(countryCode)}</span>
          ) : (
            <Image
              alt={`${countryCode} flag`}
              className="h-full w-full object-contain"
              src={getCountryFlag(countryCode)}
            />
          )}
        </span>

        {isGlobal && !disabled ? (
          <input
            className="bg-bg-surface text-text-primary w-[60px] appearance-none text-lg font-normal outline-none"
            dir="ltr"
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
                setPhoneNumber((prev) => ({
                  ...prev,
                  countryCode: value,
                }));
              } else if (value === "+") {
                setPhoneNumber((prev) => ({
                  ...prev,
                  countryCode: value,
                }));
              }
            }}
            placeholder="+1"
            type="text"
            value={countryCode}
          />
        ) : (
          <span className="text-text-placeholder text-lg font-normal" dir="ltr">
            {countryCode}
          </span>
        )}
      </div>

      {/* Phone Number Field */}
      <FloatingLabelInput
        {...floatingLabelInputProps}
        containerProps={{
          className: "flex-1",
        }}
        error={error}
        iconContainerProps={{
          className: "rtl:!right-5 rtl:end-auto",
        }}
        inputProps={{
          autoFocus: false,
          disabled,
          name,
          onChange: (e) => {
            const numericValue = e.target.value.replace(/[^0-9]/g, "");
            const maxLength = getMaxPhoneNumberLength(countryCode, storeCode);
            const limitedValue = numericValue.slice(0, maxLength);
            setPhoneNumber((prev) => ({
              ...prev,
              number: limitedValue,
            }));
          },
          onKeyPress: (e) => {
            if (!/[0-9]/.test(e.key)) e.preventDefault();
          },
          onPaste: (e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData("text");
            const numericValue = pastedText.replace(/[^0-9]/g, "");
            const maxLength = getMaxPhoneNumberLength(countryCode, storeCode);
            const limitedValue = numericValue.slice(0, maxLength);
            setPhoneNumber((prev) => ({
              ...prev,
              number: limitedValue,
            }));
          },
          value: formattedNumber,
          ...floatingLabelInputProps?.inputProps,
        }}
        success={!error && success}
      />
    </div>
  );
};
