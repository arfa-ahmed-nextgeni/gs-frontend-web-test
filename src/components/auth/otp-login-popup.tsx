"use client";

import React, { useEffect, useRef, useState } from "react";

import Image from "next/image";

import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import SmsIcon from "@/assets/icons/SMS.png";
import WhatsAppIcon from "@/assets/icons/WhatsApp.png";
import { AuthLegalConsent } from "@/components/auth/auth-legal-consent";
import { EmailSelectionPopup } from "@/components/auth/email-selection-popup";
import { OtpVerificationFeedback } from "@/components/auth/otp-verification-feedback";
import { useToastContext } from "@/components/providers/toast-provider";
import { Spinner } from "@/components/ui/spinner";
import { useUI } from "@/contexts/use-ui";
import { getCustomerQueryConfig } from "@/hooks/queries/use-customer-query";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { usePathname, useRouter } from "@/i18n/navigation";
import { otpLogin, otpVerify } from "@/lib/actions/auth/otp";
import {
  trackLogin,
  trackLoginAttempt,
  trackOtpError,
  trackOtpSuccess,
  trackRequestOtp,
  trackRequestOtpError,
  trackVerificationSmsDetected,
} from "@/lib/analytics/events";
import {
  buildUserPropertiesFromCustomer,
  formatPhoneForAnalytics,
} from "@/lib/analytics/utils/build-properties";
import { Locale, StoreCode } from "@/lib/constants/i18n";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { cn } from "@/lib/utils";
import {
  clearSuppressRegistration,
  getLoginUrlWithRedirect,
} from "@/lib/utils/auth-redirect";
import {
  getCountryFlag,
  getDefaultCountryCode,
  getMaxPhoneNumberLength,
  getPhoneNumberLength,
  isGlobalStore,
  isValidPhoneNumber,
} from "@/lib/utils/country";

interface OtpLoginPopupProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onShowRegistration?: () => void;
  storeCode: StoreCode;
}

const source = "account";

export const OtpLoginPopup: React.FC<OtpLoginPopupProps> = ({
  isOpen,
  onCloseAction,
  onShowRegistration,
  storeCode,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;
  const isMobile = useIsMobile();
  const uiContext = useUI();
  const { authorize } = uiContext;
  const { showSuccess } = useToastContext();
  const t = useTranslations("HomePage.header.otpLogin");
  const tToast = useTranslations("Toast");
  const [step, setStep] = useState<"otp" | "phone">("phone");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState(() =>
    getDefaultCountryCode(storeCode)
  );
  const [otp, setOtp] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [inputStates, setInputStates] = useState<
    ("active" | "empty" | "filled")[]
  >(["empty", "empty", "empty", "empty", "empty"]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendMethod, setResendMethod] = useState<
    "sms" | "text" | "whatsapp" | null
  >(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const [hasValidationError, setHasValidationError] = useState(false);
  const [hasBeenFocused, setHasBeenFocused] = useState(false);
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [accounts, setAccounts] = useState<
    Array<{ email: string; user_id: string }>
  >([]);
  const [showEmailSelection, setShowEmailSelection] = useState(false);
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    if (previousPathnameRef.current !== pathname && isOpen) {
      onCloseAction();
    }
    previousPathnameRef.current = pathname;
  }, [isOpen, onCloseAction, pathname]);

  useEffect(() => {
    if (isMobile && isOpen) {
      router.push(getLoginUrlWithRedirect());
    }
  }, [isMobile, isOpen, router]);

  // Countdown timer effect
  useEffect(() => {
    if (step === "otp" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [step, countdown]);

  // Reset popup state when opened
  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setOtpSent(false);
      setPhoneNumber("");
      setOtp("");
      setError("");
      setCountdown(60);
      setCanResend(false);
      setInputStates(["empty", "empty", "empty", "empty", "empty"]);
      setIsVerifying(false);
      setResendMethod(null);
      setVerificationSuccess(false);
      setHasValidationError(false);
      setHasBeenFocused(false);
      setFormattedPhoneNumber("");
      setShowToast(false);
    }
  }, [isOpen]);

  // Toast auto-hide effect
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      setHasValidationError(true);
      return;
    }

    if (!isValidPhoneNumber(phoneNumber, countryCode, storeCode)) {
      setHasValidationError(true);
      return;
    }

    // Track login_attempt event when user tries to login
    trackLoginAttempt();

    if (step === "otp") {
      setOtp("");
      setInputStates(["empty", "empty", "empty", "empty", "empty"]);
      setVerificationSuccess(false);
      setResendMethod("text");
    }

    setIsLoading(true);
    setError("");

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    const phoneForAnalytics = formatPhoneForAnalytics(countryCode, phoneNumber);

    // Track request_otp event
    trackRequestOtp({
      action: "login",
      otp_sender_type: "sms",
      phone_number: phoneForAnalytics,
      source,
    });

    try {
      const result = await otpLogin({
        mobile: fullPhoneNumber,
        storeCode,
        type: "sms",
      });

      if (result.success && result.status === 200) {
        // Track otp_success event
        trackOtpSuccess({
          action: "login",
          source,
        });

        setOtpSent(true);
        setStep("otp");
        setCountdown(60);
        setCanResend(false);
        setOtp("");
        setInputStates(["empty", "empty", "empty", "empty", "empty"]);
        setVerificationSuccess(false);
      } else {
        // Track otp_error event
        trackOtpError({
          action: "login",
          error: result.error || t("errors.sendFailed"),
          phone: phoneForAnalytics,
          source,
        });

        setError(result.error || t("errors.sendFailed"));
        setHasValidationError(true);
      }
    } catch {
      // Track otp_error event
      trackOtpError({
        action: "login",
        error: t("errors.generalError"),
        phone: phoneForAnalytics,
        source,
      });

      setError(t("errors.generalError"));
      setHasValidationError(true);
    } finally {
      setIsLoading(false);
      setResendMethod(null);
    }
  };

  const handleVerifyOtp = async (otpToVerify?: string) => {
    const otpValue = otpToVerify || otp;
    if (!otpValue.trim()) {
      setError(t("errors.otpRequired"));
      return;
    }

    setIsLoading(true);
    setIsVerifying(true);
    setError("");

    try {
      const result = await otpVerify({
        mobile: `${countryCode}${phoneNumber}`,
        otp: otpValue,
        storeCode,
      });

      if (result.success) {
        // Check if user has multiple accounts
        if (result.data?.accounts) {
          try {
            const accountsList = JSON.parse(result.data.accounts);
            setAccounts(accountsList);
            setShowEmailSelection(true);
            return;
          } catch (e) {
            console.error("Failed to parse accounts:", e);
            setError(t("errors.generalError"));
            return;
          }
        }

        // Normal flow with token
        if (result.data?.token) {
          const cookieOptions = {
            expires: 7,
            sameSite: "Lax" as const,
            secure: process.env.NODE_ENV === "production",
          };
          Cookies.set("auth_token", result.data.token, cookieOptions);

          try {
            authorize();
          } catch (error) {
            console.warn("Error in authorize():", error);
          }

          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.CART.ROOT(locale),
          });

          if (result.data.is_registered && result.data.is_registered === "1") {
            onCloseAction();
            if (onShowRegistration) {
              onShowRegistration();
            }
            clearSuppressRegistration();
          } else {
            const customer = await queryClient.fetchQuery(
              getCustomerQueryConfig(locale)
            );

            // Track login event with user data
            trackLogin(buildUserPropertiesFromCustomer(customer));
            setVerificationSuccess(true);
            showSuccess(
              (tToast as any)("success.message", { name: "User" }),
              tToast("success.description"),
              "bottom"
            );

            setTimeout(() => {
              onCloseAction();
              clearSuppressRegistration();
            }, 3300);
          }
        } else {
          // Incorrect OTP entered
          trackRequestOtpError({
            action: "verify",
            error: result.error || t("errors.verifyFailed"),
            phone_number: formatPhoneForAnalytics(countryCode, phoneNumber),
            source,
          });

          setError(t("errors.verifyFailed"));
          setVerificationSuccess(false);
        }
      } else {
        // Incorrect OTP or verification failure reported by API
        trackRequestOtpError({
          action: "verify",
          error: result.error || t("errors.verifyFailed"),
          phone_number: formatPhoneForAnalytics(countryCode, phoneNumber),
          source,
        });

        setError(result.error || t("errors.verifyFailed"));
        setVerificationSuccess(false);
      }
    } catch {
      // API/network failure during verify
      trackOtpError({
        action: "verify",
        error: t("errors.generalError"),
        phone: formatPhoneForAnalytics(countryCode, phoneNumber),
        source,
      });

      setError(t("errors.generalError"));
      setVerificationSuccess(false);
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setStep("phone");
    setPhoneNumber("");
    setFormattedPhoneNumber("");
    setOtp("");
    setError("");
    setHasBeenFocused(false);
    setAccounts([]);
    setResendMethod(null);
    setShowEmailSelection(false);
    onCloseAction();
  };

  const handleWhatsAppOtp = async () => {
    if (!canResend || isLoading || verificationSuccess) {
      return;
    }

    setIsLoading(true);
    setResendMethod("whatsapp");
    setError("");

    const source = "account";
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    const phoneForAnalytics = formatPhoneForAnalytics(countryCode, phoneNumber);

    // Track request_otp event (resend WhatsApp)
    trackRequestOtp({
      action: "login",
      otp_sender_type: "whatsapp",
      phone_number: phoneForAnalytics,
      source,
    });

    try {
      const result = await otpLogin({
        mobile: fullPhoneNumber,
        storeCode,
        type: "whatsapp",
      });

      if (result.success && result.status === 200) {
        // Track otp_success event
        trackOtpSuccess({
          action: "login",
          source,
        });

        setCountdown(60);
        setCanResend(false);
        setOtp("");
        setInputStates(["empty", "empty", "empty", "empty", "empty"]);
        setError("");
        setIsVerifying(false);
        setVerificationSuccess(false);
      } else {
        // Track otp_error event
        trackOtpError({
          action: "login",
          error: result.error || t("errors.sendFailed"),
          phone: phoneForAnalytics,
          source,
        });

        setError(result.error || t("errors.sendFailed"));
      }
    } catch {
      // Track otp_error event
      trackOtpError({
        action: "login",
        error: t("errors.generalError"),
        phone: phoneForAnalytics,
        source,
      });

      setError(t("errors.generalError"));
    } finally {
      setIsLoading(false);
      setResendMethod(null);
    }
  };

  const handleSmsOtp = async () => {
    if (!canResend || isLoading || verificationSuccess) {
      return;
    }

    setIsLoading(true);
    setResendMethod("sms");
    setError("");

    const source = "account";
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    const phoneForAnalytics = formatPhoneForAnalytics(countryCode, phoneNumber);

    // Track request_otp event (resend SMS)
    trackRequestOtp({
      action: "login",
      otp_sender_type: "sms",
      phone_number: phoneForAnalytics,
      source,
    });

    try {
      const result = await otpLogin({
        mobile: fullPhoneNumber,
        storeCode,
        type: "sms",
      });

      if (result.success && result.status === 200) {
        // Track otp_success event
        trackOtpSuccess({
          action: "login",
          source,
        });
        setCountdown(60);
        setCanResend(false);
        setOtp("");
        setInputStates(["empty", "empty", "empty", "empty", "empty"]);
        setError("");
        setIsVerifying(false);
        setVerificationSuccess(false);
      } else {
        trackOtpError({
          action: "login",
          error: result.error || t("errors.sendFailed"),
          phone: phoneForAnalytics,
          source,
        });
        setError(result.error || t("errors.sendFailed"));
      }
    } catch {
      trackOtpError({
        action: "login",
        error: t("errors.generalError"),
        phone: phoneForAnalytics,
        source,
      });
      setError(t("errors.generalError"));
    } finally {
      setIsLoading(false);
      setResendMethod(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-[400px] rounded-3xl bg-white p-6 shadow-xl">
        {/* Close Button */}
        <button
          className="absolute right-6 top-6 text-[#374957] hover:text-gray-600"
          onClick={handleClose}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-2 mt-10">
          <h1 className="text-4xl font-normal text-gray-700">{t("title")}</h1>
        </div>

        {step === "phone" ? (
          <>
            <div>
              <p className="mb-10 text-sm text-gray-500">
                {t("phoneStep.description")}
              </p>

              <div className="mb-5">
                <div className="flex h-[50px] gap-2 rtl:flex-row-reverse">
                  <div className="flex h-[50px] w-auto items-center rounded-xl bg-gray-100 px-4 py-2 rtl:flex-row-reverse">
                    <span className="text-l flex h-[20px] w-[30px] items-center rtl:mr-2">
                      {typeof getCountryFlag(countryCode) === "string" ? (
                        <span className="text-lg">
                          {getCountryFlag(countryCode)}
                        </span>
                      ) : (
                        <Image
                          alt={`${countryCode} flag`}
                          className="h-full w-full object-contain"
                          src={getCountryFlag(countryCode)}
                        />
                      )}
                    </span>
                    {isGlobalStore(storeCode) ? (
                      <input
                        className="w-[60px] bg-[#FAFAFA] text-lg font-normal outline-none"
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
                            setCountryCode(value);
                          } else if (value === "+") {
                            setCountryCode(value); // Allow just "+" while typing
                          }
                        }}
                        placeholder="+1"
                        type="text"
                        value={countryCode}
                      />
                    ) : (
                      <span
                        className="text-lg font-normal text-gray-700"
                        dir="ltr"
                      >
                        {countryCode}
                      </span>
                    )}
                  </div>

                  <div className="relative flex-1">
                    {hasBeenFocused && (
                      <div className="absolute -top-3 left-0 right-0 z-10 flex items-center px-4 rtl:flex-row-reverse">
                        <div className="bg-white px-2">
                          <label
                            className={`text-xs font-normal ${
                              hasValidationError
                                ? "text-orange-500"
                                : phoneNumber.length === 0
                                  ? "hidden"
                                  : isValidPhoneNumber(
                                        phoneNumber,
                                        countryCode,
                                        storeCode
                                      ) && !isGlobalStore(storeCode)
                                    ? "text-green-500"
                                    : "text-gray-400"
                            }`}
                          >
                            {t("phoneStep.phoneLabel")}
                          </label>
                        </div>
                      </div>
                    )}

                    <div
                      className={`relative flex h-[50px] w-[225px] items-center rounded-xl bg-[#FAFAFA] px-4 py-6 text-gray-300 ${
                        hasValidationError
                          ? "border-2 border-orange-500"
                          : isValidPhoneNumber(
                                phoneNumber,
                                countryCode,
                                storeCode
                              ) &&
                              !hasValidationError &&
                              !isGlobalStore(storeCode)
                            ? "border-2 border-green-500"
                            : phoneNumber.length === 0
                              ? "border-gray-300 hover:border-2 hover:border-gray-400"
                              : "border-2 border-gray-300"
                      }`}
                    >
                      <input
                        className="rtl:placeholder:dir-ltr flex-1 border-none bg-transparent text-lg font-medium text-gray-700 outline-none placeholder:text-gray-300 rtl:w-[200px]"
                        dir="ltr"
                        onBlur={() => {}}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          );
                          const maxLength = getMaxPhoneNumberLength(
                            countryCode,
                            storeCode
                          );
                          const limitedValue = numericValue.slice(0, maxLength);

                          let formattedValue = limitedValue;
                          if (limitedValue.length > 0) {
                            if (limitedValue.length <= 2) {
                              formattedValue = limitedValue;
                            } else if (limitedValue.length <= 5) {
                              formattedValue = `${limitedValue.slice(0, 2)} ${limitedValue.slice(2)}`;
                            } else {
                              formattedValue = `${limitedValue.slice(0, 2)} ${limitedValue.slice(2, 5)} ${limitedValue.slice(5)}`;
                            }
                          }

                          setPhoneNumber(limitedValue);
                          setFormattedPhoneNumber(formattedValue);
                          setHasValidationError(false);
                        }}
                        onFocus={() => {
                          setHasBeenFocused(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSendOtp();
                          }
                        }}
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedText = e.clipboardData.getData("text");
                          const numericValue = pastedText.replace(
                            /[^0-9]/g,
                            ""
                          );
                          const maxLength = getMaxPhoneNumberLength(
                            countryCode,
                            storeCode
                          );
                          const limitedValue = numericValue.slice(0, maxLength);

                          let formattedValue = limitedValue;
                          if (limitedValue.length > 0) {
                            if (limitedValue.length <= 2) {
                              formattedValue = limitedValue;
                            } else if (limitedValue.length <= 5) {
                              formattedValue = `${limitedValue.slice(0, 2)} ${limitedValue.slice(2)}`;
                            } else {
                              formattedValue = `${limitedValue.slice(0, 2)} ${limitedValue.slice(2, 5)} ${limitedValue.slice(5)}`;
                            }
                          }

                          setPhoneNumber(limitedValue);
                          setFormattedPhoneNumber(formattedValue);
                          setHasValidationError(false);
                        }}
                        placeholder={t("phoneStep.phonePlaceholder")}
                        style={{
                          direction: "ltr",
                          textAlign: "left",
                          unicodeBidi: "embed",
                        }}
                        type="tel"
                        value={formattedPhoneNumber}
                      />

                      {isValidPhoneNumber(
                        phoneNumber,
                        countryCode,
                        storeCode
                      ) &&
                        !hasValidationError &&
                        !isGlobalStore(storeCode) && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 transform rtl:left-3">
                            <div className="flex h-3 w-3 items-center justify-center rounded-full bg-green-500">
                              <span className="text-[8px] text-white">✓</span>
                            </div>
                          </div>
                        )}
                      {(phoneNumber.length <
                        getPhoneNumberLength(countryCode) ||
                        phoneNumber.length ===
                          getPhoneNumberLength(countryCode)) &&
                        hasValidationError && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 transform rtl:left-3">
                            <div
                              className="flex h-3 w-3 cursor-pointer items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600"
                              onClick={() => setPhoneNumber("")}
                            >
                              <span className="text-[8px] text-white">✕</span>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 text-center text-sm text-red-600">
                  {error}
                </div>
              )}

              <p className="mb-10 w-[340px] text-sm text-gray-500">
                {t("phoneStep.otpDescription")}
              </p>

              <button
                className="w-full rounded-2xl bg-gray-700 p-4 text-lg font-normal text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
                onClick={handleSendOtp}
              >
                {isLoading
                  ? t("phoneStep.sendingButton")
                  : t("phoneStep.sendButton")}
              </button>

              <AuthLegalConsent className="mt-5" />
            </div>
          </>
        ) : (
          <>
            <div className="mt-2">
              {otpSent ? (
                <>
                  <p className="mb-8 text-base text-gray-600">
                    {t("otpStep.description")}{" "}
                    <span
                      className="font-medium text-gray-800 underline"
                      dir="ltr"
                    >
                      {countryCode} {formattedPhoneNumber}
                    </span>{" "}
                    <button
                      className="ml-2 text-gray-600 underline hover:text-gray-800"
                      onClick={() => {
                        setStep("phone");
                        setOtp("");
                        setInputStates([
                          "empty",
                          "empty",
                          "empty",
                          "empty",
                          "empty",
                        ]);
                        setError("");
                        setIsVerifying(false);
                        setVerificationSuccess(false);
                      }}
                    >
                      ✏️
                    </button>
                  </p>
                </>
              ) : (
                <p className="mb-8 text-center text-base text-gray-600">
                  Sending OTP to {countryCode} {phoneNumber}...
                </p>
              )}

              {otpSent && (
                <div className="flex justify-center">
                  <div className="flex gap-2 rtl:flex-row-reverse">
                    {[0, 1, 2, 3, 4].map((index) => {
                      const currentValue = otp[index] || "";
                      const isEmpty = !currentValue;
                      const isFilled = !!currentValue;

                      let inputClass =
                        "h-13 w-13 rounded-2xl text-center text-lg font-mono transition-all duration-200 focus:outline-none ";

                      if (verificationSuccess) {
                        inputClass +=
                          "border-2 border-green-500 bg-green-100 text-green-800 animate-pulse";
                      } else if (isVerifying) {
                        inputClass +=
                          "border-2 border-blue-500 bg-blue-50 text-blue-700 animate-pulse";
                      } else if (error && isFilled) {
                        inputClass +=
                          "border-2 border-[#FE5000] bg-orange-50 text-[#FE5000] shadow-sm";
                      } else if (isEmpty) {
                        inputClass +=
                          "border-2 border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200";
                      } else if (isFilled) {
                        inputClass +=
                          "border-2 border-green-400 bg-green-50 text-green-700 shadow-sm";
                      }

                      return (
                        <input
                          autoFocus={index === 0}
                          className={inputClass}
                          dir="ltr"
                          key={index}
                          maxLength={1}
                          onBlur={() => {
                            const newStates = [...inputStates];
                            newStates[index] = currentValue
                              ? "filled"
                              : "empty";
                            setInputStates(newStates);
                          }}
                          onChange={(e) => {
                            const newOtp = otp.split("");
                            newOtp[index] = e.target.value;
                            const finalOtp = newOtp.join("");
                            setOtp(finalOtp);
                            const newStates = [...inputStates];
                            newStates[index] = e.target.value
                              ? "filled"
                              : "empty";
                            setInputStates(newStates);

                            if (e.target.value && index < 4) {
                              const nextInput = e.target.parentElement
                                ?.children[index + 1] as HTMLInputElement;
                              nextInput?.focus();
                            }

                            if (finalOtp.length === 5) {
                              trackVerificationSmsDetected({
                                phone: formatPhoneForAnalytics(
                                  countryCode,
                                  phoneNumber
                                ),
                              });
                              handleVerifyOtp(finalOtp);
                            }
                          }}
                          onFocus={() => {
                            const newStates = [...inputStates];
                            newStates[index] = currentValue
                              ? "filled"
                              : "active";
                            setInputStates(newStates);
                          }}
                          onInput={(e) => {
                            const input = e.target as HTMLInputElement;
                            const value = input.value;

                            if (value.length === 5 && /^\d{5}$/.test(value)) {
                              e.preventDefault();
                              setOtp(value);

                              const newStates = Array(5).fill(
                                "filled" as const
                              );
                              setInputStates(newStates);

                              trackVerificationSmsDetected({
                                phone: formatPhoneForAnalytics(
                                  countryCode,
                                  phoneNumber
                                ),
                              });
                              setTimeout(() => {
                                handleVerifyOtp(value);
                              }, 100);

                              input.value = "";
                            }
                          }}
                          onKeyDown={(e) => {
                            if (
                              e.key === "Backspace" &&
                              !e.currentTarget.value &&
                              index > 0
                            ) {
                              const prevInput = e.currentTarget.parentElement
                                ?.children[index - 1] as HTMLInputElement;
                              prevInput?.focus();
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pastedData = e.clipboardData.getData("text");
                            const numericData = pastedData.replace(/\D/g, "");

                            if (numericData.length === 5) {
                              const otpArray = numericData.split("");
                              setOtp(numericData);

                              const newStates = otpArray.map(
                                () => "filled" as const
                              );
                              setInputStates(newStates);

                              trackVerificationSmsDetected({
                                phone: formatPhoneForAnalytics(
                                  countryCode,
                                  phoneNumber
                                ),
                              });
                              setTimeout(() => {
                                handleVerifyOtp(numericData);
                              }, 100);
                            }
                          }}
                          type="text"
                          value={currentValue}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {otpSent && isVerifying && (
                <OtpVerificationFeedback className="my-4" variant="popup" />
              )}

              {otpSent && !isVerifying && (
                <div className="mb-2 pr-8 text-right">
                  {verificationSuccess ? (
                    <div className="flex items-center justify-center">
                      {/* <div className="flex h-10 w-10 animate-bounce items-center justify-center rounded-full bg-green-100">
                        <span className="text-2xl text-green-600">✓</span>
                      </div> */}
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-orange-500">
                      {Math.floor(countdown / 60)
                        .toString()
                        .padStart(2, "0")}
                      :{(countdown % 60).toString().padStart(2, "0")}
                    </span>
                  )}
                </div>
              )}

              {error && (
                <div className="mb-4 text-center text-sm text-red-600">
                  {error}
                </div>
              )}

              {otpSent && (
                <>
                  <div className="mb-2.5 text-center">
                    <span className="text-sm text-gray-500">
                      {t("otpStep.resendText")}{" "}
                    </span>
                    <button
                      className={`text-sm font-medium transition-all duration-200 ${
                        canResend && !verificationSuccess
                          ? "text-sm text-gray-700 underline hover:text-gray-900"
                          : "cursor-not-allowed text-gray-400"
                      }`}
                      disabled={!canResend || verificationSuccess}
                      onClick={
                        canResend && !verificationSuccess
                          ? handleSendOtp
                          : undefined
                      }
                    >
                      {resendMethod === "text"
                        ? t("phoneStep.sendingButton")
                        : t("otpStep.resendButton")}
                    </button>
                  </div>

                  <div className="flex justify-center gap-2">
                    <button
                      className="relative flex items-center justify-center rounded-2xl bg-green-100 transition-all duration-200 hover:scale-105 hover:bg-green-200 active:scale-95 disabled:opacity-50"
                      disabled={!canResend || isLoading || verificationSuccess}
                      onClick={
                        canResend && !isLoading && !verificationSuccess
                          ? handleWhatsAppOtp
                          : undefined
                      }
                      title="Send via WhatsApp"
                    >
                      <div className="flex flex-col items-center">
                        <Image
                          alt="WhatsApp"
                          className={cn("size-12.5", {
                            "opacity-40": resendMethod === "whatsapp",
                          })}
                          height={50}
                          src={WhatsAppIcon}
                          width={50}
                        />
                        {resendMethod === "whatsapp" ? (
                          <Spinner
                            className="absolute inset-0 m-auto size-7"
                            size={28}
                            variant="dark"
                          />
                        ) : null}
                      </div>
                    </button>
                    <button
                      className="relative flex items-center justify-center rounded-2xl bg-blue-100 transition-all duration-200 hover:scale-105 hover:bg-blue-200 active:scale-95 disabled:opacity-50"
                      disabled={!canResend || isLoading || verificationSuccess}
                      onClick={
                        canResend && !isLoading && !verificationSuccess
                          ? handleSmsOtp
                          : undefined
                      }
                      title="Send via SMS"
                    >
                      <div className="flex flex-col items-center">
                        <Image
                          alt="SMS"
                          className={cn("size-12.5", {
                            "opacity-40": resendMethod === "sms",
                          })}
                          height={50}
                          src={SmsIcon}
                          width={50}
                        />
                        {resendMethod === "sms" ? (
                          <Spinner
                            className="absolute inset-0 m-auto size-7"
                            size={28}
                            variant="dark"
                          />
                        ) : null}
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Email Selection Popup */}
      <EmailSelectionPopup
        accounts={accounts}
        isOpen={showEmailSelection}
        mobile={`${countryCode}${phoneNumber}`}
        onCloseAction={() => {
          setShowEmailSelection(false);
          setAccounts([]);
          onCloseAction();
        }}
        otp={otp}
        storeCode={storeCode}
      />
    </div>
  );
};
