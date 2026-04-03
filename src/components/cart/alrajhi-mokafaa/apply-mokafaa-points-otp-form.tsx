"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

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
import { isError } from "@/lib/utils/service-result";

interface ApplyMokafaaPointsOtpFormProps {
  countryCode: string;
  mobileNumber: string;
  onOtpTokenUpdated?: (otpToken: string) => void;
  onRetryOtp?: () => void;
  onSuccess: () => void;
  otpToken: string;
  pointsAmount?: number;
}

export const ApplyMokafaaPointsOtpForm = ({
  countryCode,
  mobileNumber,
  onOtpTokenUpdated,
  onRetryOtp,
  onSuccess,
  otpToken,
  pointsAmount = 0,
}: ApplyMokafaaPointsOtpFormProps) => {
  const t = useTranslations("CartPage.orderSummary.mokafaa");
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
  const [countdown, setCountdown] = useState(180); // 3 minutes
  const [canRetry, setCanRetry] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [amountError, setAmountError] = useState("");

  const paymentMethod = cart?.selectedPaymentMethod?.code || "";

  // Countdown logic (3 minutes)
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }

    // Schedule the state update asynchronously (prevents cascading renders)
    const id = setTimeout(() => setCanRetry(true), 0);
    return () => clearTimeout(id);
  }, [countdown]);

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
            dir: "ltr",
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
            dir: "ltr",
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
                      setCanRetry(true); // Allow retry again on error
                    },
                    onSuccess: (res) => {
                      if (!res || (res as any).error) {
                        setOtpError((res as any).error || t("errors.generic"));
                        setCanRetry(true); // Allow retry again on error
                        return;
                      }

                      // OTP was sent successfully, start countdown and update the token
                      setCountdown(180);
                      setCanRetry(false);
                      const newOtpToken = res.data?.otpToken || "";
                      if (newOtpToken && onOtpTokenUpdated) {
                        onOtpTokenUpdated(newOtpToken);
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
            className: "left-5",
          }}
          inputProps={{
            className: "pl-10",
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
            dir: "ltr",
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
