"use client";

import { FormEvent, useState } from "react";

import { useTranslations } from "next-intl";

import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { useAuthenticateMokafaaCustomer } from "@/hooks/mutations/alrajhi-mokafaa/use-authenticate-mokafaa-customer";
import { useRouteMatch } from "@/hooks/use-route-match";
import {
  trackMokafaaOldOtpValid,
  trackMokafaaPhoneValidationFailure,
  trackMokafaaPhoneValidationSuccess,
} from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";
import { StoreCode } from "@/lib/constants/i18n";
import { isValidPhoneNumber } from "@/lib/utils/country";
import { isError } from "@/lib/utils/service-result";

interface InputMokafaaNumberFormProps {
  initialOtpToken?: string;
  initialPhoneValue?: {
    countryCode: string;
    number: string;
  };
  onOtpRequested?: (data: {
    countryCode: string;
    mobileNumber: string;
    otpToken: string;
  }) => void;
  onSuccess: () => void;
}

export const InputMokafaaNumberForm = ({
  initialOtpToken,
  initialPhoneValue,
  onOtpRequested,
  onSuccess,
}: InputMokafaaNumberFormProps) => {
  const t = useTranslations("CartPage.orderSummary.mokafaa");
  const { cart } = useCart();
  const { storeConfig } = useStoreConfig();
  const { isCheckout } = useRouteMatch();
  const authenticateMutation = useAuthenticateMokafaaCustomer();

  const [phoneValue, setPhoneValue] = useState({
    countryCode: initialPhoneValue?.countryCode || "+966",
    number: initialPhoneValue?.number || "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!phoneValue.number) {
      setError(t("errors.required"));
      return;
    }

    if (
      !isValidPhoneNumber(
        phoneValue.number,
        phoneValue.countryCode,
        StoreCode.en_sa
      )
    ) {
      setError(t("errors.invalid"));
      return;
    }

    setError("");

    authenticateMutation.mutate(
      {
        cartId: cart?.id || "",
        mobileNumber: `${phoneValue.countryCode}${phoneValue.number}`,
      },
      {
        onError: (err) => {
          setError(err?.message || t("errors.generic"));
        },
        onSuccess: (res) => {
          // Build cart properties for analytics
          const cartProperties = cart
            ? buildCartProperties(
                cart,
                isCheckout ? { storeConfig } : undefined
              )
            : undefined;
          const paymentMethod = cart?.selectedPaymentMethod?.code || "";
          const eventProperties = cartProperties
            ? { ...cartProperties, payment_method: paymentMethod }
            : undefined;

          if (isError(res)) {
            if (res.error?.toLowerCase?.()?.includes("otp")) {
              // Track mokafaa_old_otp_valid when OTP is still valid and user tries to request a new OTP
              trackMokafaaOldOtpValid(eventProperties);
              if (onOtpRequested && initialOtpToken) {
                onOtpRequested({
                  countryCode: phoneValue.countryCode,
                  mobileNumber: phoneValue.number,
                  otpToken: initialOtpToken || "",
                });
                return;
              }
            } else {
              // Track mokafaa_phone_validation_failure when authentication fails
              trackMokafaaPhoneValidationFailure(eventProperties);
            }
            setError(res.error || t("errors.generic"));
            return;
          }

          // Track mokafaa_phone_validation_success when phone validation succeeds
          trackMokafaaPhoneValidationSuccess(eventProperties);

          // OTP was sent successfully
          if (onOtpRequested) {
            onOtpRequested({
              countryCode: phoneValue.countryCode,
              mobileNumber: phoneValue.number,
              otpToken: res.data?.otpToken || "",
            });
          } else {
            onSuccess();
          }
        },
      }
    );
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <PhoneNumberInput
        disabled={authenticateMutation.isPending}
        error={
          !!error ||
          (!!phoneValue.number &&
            !isValidPhoneNumber(
              phoneValue.number,
              phoneValue.countryCode,
              StoreCode.en_sa
            ))
        }
        floatingLabelInputProps={{
          helperText: error || undefined,
          label: t("mobileNumberlabel"),
        }}
        name="phone"
        onChange={setPhoneValue}
        success={
          !error &&
          !!phoneValue.number &&
          isValidPhoneNumber(
            phoneValue.number,
            phoneValue.countryCode,
            StoreCode.en_sa
          )
        }
        value={phoneValue}
      />

      <FormSubmitButton
        className="mt-5"
        disabled={
          !phoneValue.number ||
          !isValidPhoneNumber(
            phoneValue.number,
            phoneValue.countryCode,
            StoreCode.en_sa
          ) ||
          authenticateMutation.isPending
        }
        isSubmitting={authenticateMutation.isPending}
      >
        {t("requestOtp")}
      </FormSubmitButton>
    </form>
  );
};
