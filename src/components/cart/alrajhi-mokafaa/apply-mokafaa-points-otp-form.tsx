"use client";

import { useEffect, useState } from "react";

import { useLocale, useTranslations } from "next-intl";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { useTrackMokafaaErrors } from "@/hooks/analytics/use-track-mokafaa-errors";
import { useAuthenticateMokafaaCustomer } from "@/hooks/mutations/alrajhi-mokafaa/use-authenticate-mokafaa-customer";
import { useRedeemMokafaaPoints } from "@/hooks/mutations/alrajhi-mokafaa/use-redeem-mokafaa-points";
import { useRouteMatch } from "@/hooks/use-route-match";
import {
  trackMokafaaOtpResend,
  trackMokafaaTransactionSuccess,
} from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";
import { cn } from "@/lib/utils";
import { getLocaleInfo } from "@/lib/utils/locale";
import { isError } from "@/lib/utils/service-result";

interface ApplyMokafaaPointsOtpFormProps {
  countryCode: string;
  mobileNumber: string;
  onOtpTokenUpdated?: (data: {
    otpExpiresAt: number;
    otpToken: string;
  }) => void;
  onRetryOtp?: () => void;
  onSuccess: () => void;
  otpExpiresAt: number;
  otpToken: string;
  pointsAmount?: number;
}

const DEFAULT_OTP_EXPIRY_SECONDS = 180;

const getOtpExpiryTimestamp = (expiresInMin?: null | number | string) => {
  const parsedExpiryInMin = Number(expiresInMin);

  if (Number.isFinite(parsedExpiryInMin) && parsedExpiryInMin > 0) {
    return Date.now() + parsedExpiryInMin * 60 * 1000;
  }

  return Date.now() + DEFAULT_OTP_EXPIRY_SECONDS * 1000;
};

export const ApplyMokafaaPointsOtpForm = ({
  countryCode,
  mobileNumber,
  onOtpTokenUpdated,
  onRetryOtp,
  onSuccess,
  otpExpiresAt,
  otpToken,
  pointsAmount = 0,
}: ApplyMokafaaPointsOtpFormProps) => {
  const t = useTranslations("CartPage.orderSummary.mokafaa");
  const locale = useLocale();
  const { language } = getLocaleInfo(locale);
  const dir = language === "ar" ? "rtl" : "ltr";
  const { cart } = useCart();
  const { storeConfig } = useStoreConfig();
  const { isCheckout } = useRouteMatch();
  const { trackAmountError, trackOtpError } = useTrackMokafaaErrors();
  const redeemMutation = useRedeemMokafaaPoints();
  const authenticateMutation = useAuthenticateMokafaaCustomer();

  const [otp, setOtp] = useState("");
  const [amount, setAmount] = useState(
    pointsAmount > 0 ? pointsAmount.toString() : ""
  );
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [otpError, setOtpError] = useState("");
  const [amountError, setAmountError] = useState("");

  const paymentMethod = cart?.selectedPaymentMethod?.code || "";

  // Keep timer based on absolute expiry timestamp so remount does not reset countdown.
  useEffect(() => {
    setNowTs(Date.now());
  }, [otpExpiresAt]);

  useEffect(() => {
    const timer = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const countdown = Math.max(0, Math.ceil((otpExpiresAt - nowTs) / 1000));
  const canRetry = countdown <= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setOtpError("");
    setAmountError("");

    let hasError = false;

    if (!otp.trim()) {
      setOtpError(t("errors.otpRequired"));
      hasError = true;
    }

    if (!amount || parseFloat(amount) <= 0) {
      // Track mokafaa_amount_error when amount is invalid
      trackAmountError();
      setAmountError(t("errors.required"));
      hasError = true;
    } else {
      const redemptionAmount = parseFloat(amount);
      const cartTotal = cart?.grandTotalPrice || 0;

      // Check if redemption amount exceeds cart total
      if (redemptionAmount > cartTotal) {
        // Track mokafaa_amount_error when amount exceeds total
        trackAmountError();
        setAmountError(t("errors.amountExceedsTotal"));
        hasError = true;
      }
    }

    if (hasError) {
      return;
    }

    redeemMutation.mutate(
      {
        amount: parseFloat(amount),
        cartId: cart?.id || "",
        otpToken,
        otpValue: otp,
      },
      {
        onError: (err) => {
          console.error("REDEEM ERROR:", err);
          // Check if error message indicates amount exceeds total
          const errorMessage = err?.message || "";
          if (
            errorMessage.toLowerCase().includes("exceed") ||
            errorMessage.toLowerCase().includes("maximum") ||
            errorMessage.toLowerCase().includes("greater than")
          ) {
            // Track mokafaa_amount_error when amount error occurs
            trackAmountError();
            setAmountError(t("errors.amountExceedsTotal"));
          } else {
            // Track mokafaa_otp_error for other errors (likely OTP related)
            trackOtpError();
            setAmountError(errorMessage || t("errors.generalError"));
          }
        },
        onSuccess: (result) => {
          if (result && isError(result)) {
            const errorMessage = result.error || "";
            // Check if error message indicates amount exceeds total
            if (
              errorMessage.toLowerCase().includes("exceed") ||
              errorMessage.toLowerCase().includes("maximum") ||
              errorMessage.toLowerCase().includes("greater than")
            ) {
              // Track mokafaa_amount_error when amount error occurs
              trackAmountError();
              setAmountError(t("errors.amountExceedsTotal"));
            } else if (
              errorMessage.toLowerCase().includes("otp") ||
              errorMessage.toLowerCase().includes("invalid") ||
              errorMessage.toLowerCase().includes("verify")
            ) {
              // Track mokafaa_otp_error when OTP error occurs
              trackOtpError();
              setOtpError(errorMessage || t("errors.verifyFailed"));
            } else {
              // Track mokafaa_amount_error for other errors
              trackAmountError();
              setAmountError(errorMessage || t("errors.generalError"));
            }
          } else {
            // Track mokafaa_transaction_success when transaction is successful
            const cartProperties = cart
              ? buildCartProperties(
                  cart,
                  isCheckout ? { storeConfig } : undefined
                )
              : undefined;
            const eventProperties = cartProperties
              ? { ...cartProperties, payment_method: paymentMethod }
              : undefined;
            trackMokafaaTransactionSuccess(eventProperties);
            onSuccess();
          }
        },
      }
    );
  };

  return (
    <form
      className="flex w-full flex-col gap-[31px] space-y-4 text-gray-700"
      onSubmit={handleSubmit}
    >
      {/* OTP Input */}
      <div className="relative">
        <FloatingLabelInput
          error={!!otpError}
          helperText={otpError || ""}
          inputProps={{
            dir,
            disabled: redeemMutation.isPending,
            maxLength: 4,
            name: "otp",
            onChange: (e) => {
              setOtp(e.target.value);
              if (otpError) setOtpError("");
            },
            placeholder: t("otpPlaceholder"),
            type: "text",
            value: otp,
          }}
          label={t("otpLabel")}
          labelProps={{
            dir,
          }}
        />

        {/* Timer / Retry link */}
        <div className="absolute -bottom-6 right-0 text-right">
          {canRetry ? (
            <button
              className="text-sm text-gray-500 underline hover:text-gray-700 disabled:opacity-50"
              disabled={authenticateMutation.isPending}
              onClick={() => {
                // Build cart properties for analytics
                const cartProperties = cart
                  ? buildCartProperties(
                      cart,
                      isCheckout ? { storeConfig } : undefined
                    )
                  : undefined;
                const eventProperties = cartProperties
                  ? { ...cartProperties, payment_method: paymentMethod }
                  : undefined;

                // Track mokafaa_otp_resend when user resends OTP
                trackMokafaaOtpResend(eventProperties);
                setOtpError("");

                // Call the same API as the initial OTP request
                authenticateMutation.mutate(
                  {
                    cartId: cart?.id || "",
                    mobileNumber: `${countryCode}${mobileNumber}`,
                  },
                  {
                    onError: (err: any) => {
                      setOtpError(err?.message || t("errors.generic"));
                    },
                    onSuccess: (res) => {
                      if (!res || (res as any).error) {
                        setOtpError((res as any).error || t("errors.generic"));
                        return;
                      }

                      // OTP was sent successfully, update token and absolute expiry timestamp.
                      const newOtpToken = res.data?.otpToken || "";
                      const newOtpExpiresAt = getOtpExpiryTimestamp(
                        res.data?.expiresInMin
                      );
                      if (newOtpToken && onOtpTokenUpdated) {
                        onOtpTokenUpdated({
                          otpExpiresAt: newOtpExpiresAt,
                          otpToken: newOtpToken,
                        });
                      }
                      onRetryOtp?.();
                    },
                  }
                );
              }}
              type="button"
            >
              {t("otpResend")}
            </button>
          ) : (
            <span className="text-sm text-orange-500">
              {Math.floor(countdown / 60)
                .toString()
                .padStart(2, "0")}
              :{(countdown % 60).toString().padStart(2, "0")}
            </span>
          )}
        </div>
      </div>

      {/* Amount Input */}
      <div className="relative">
        <FloatingLabelInput
          error={!!amountError}
          helperText={amountError || ""}
          iconContainerProps={{
            children: (
              <span className="text-text-primary font-gilroy text-lg font-normal">
                {">"}
              </span>
            ),
            className: "start-5",
          }}
          inputProps={{
            className: cn(language === "ar" ? "pe-10 text-right" : "ps-10"),
            dir: "ltr",
            disabled: redeemMutation.isPending,
            max: 9999,
            min: 1,
            name: "amount",
            onChange: (e) => {
              setAmount(e.target.value);
              if (amountError) setAmountError("");
            },
            placeholder: t("amountPlaceholder"),
            type: "number",
            value: amount,
          }}
          label={t("amountLabel")}
          labelProps={{
            dir,
          }}
        />
      </div>

      {/* Submit */}
      <FormSubmitButton
        disabled={!otp || !amount || redeemMutation.isPending}
        isSubmitting={redeemMutation.isPending}
        type="submit"
      >
        {t("verifyOtp")}
      </FormSubmitButton>
    </form>
  );
};
