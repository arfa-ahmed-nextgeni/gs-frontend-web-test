"use client";

import { useCallback, useEffect, useState } from "react";

import Image from "next/image";

import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useLocale, useTranslations } from "next-intl";

import AlertIcon from "@/assets/icons/Alert.svg";
import ArrowBack from "@/assets/icons/arrow-back.svg";
import CustomerServiceIcon from "@/assets/icons/customer-service-icon.svg";
import InformativeIcon from "@/assets/icons/informative-icon.svg";
import SmsIcon from "@/assets/icons/SMS.png";
import WhatsAppIcon from "@/assets/icons/WhatsApp.png";
import { AuthLegalConsent } from "@/components/auth/auth-legal-consent";
import { OtpVerificationFeedback } from "@/components/auth/otp-verification-feedback";
import { useToastContext } from "@/components/providers/toast-provider";
import { toast } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { useUI } from "@/contexts/use-ui";
import { useStoreCode } from "@/hooks/i18n/use-store-code";
import { getCustomerQueryConfig } from "@/hooks/queries/use-customer-query";
import { useRouteMatch } from "@/hooks/use-route-match";
import { Link, useRouter } from "@/i18n/navigation";
import { otpLogin, otpVerify, selectAccount } from "@/lib/actions/auth/otp";
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
import { Locale } from "@/lib/constants/i18n";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import {
  clearSuppressRegistration,
  getPostLoginRedirectUrl,
} from "@/lib/utils/auth-redirect";
import {
  getCountryFlag,
  getDefaultCountryCode,
  getMaxPhoneNumberLength,
  getPhoneNumberLength,
  isGlobalStore,
  isValidPhoneNumber,
} from "@/lib/utils/country";

const source = "account";
export function LoginForm() {
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;
  const { storeCode } = useStoreCode();
  const { authorize } = useUI();
  const router = useRouter();
  const { showResend, showSuccess } = useToastContext();
  const t = useTranslations("HomePage.header.mobileOtpLogin");
  const tToast = useTranslations("Toast");
  const { isLogin } = useRouteMatch();

  // Get redirect URL from search params
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : undefined;
  const [step, setStep] = useState<"email-selection" | "otp" | "phone">(
    "phone"
  );
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
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const [hasBeenFocused, setHasBeenFocused] = useState(false);
  const [accounts, setAccounts] = useState<
    Array<{ email: string; user_id: string }>
  >([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const resetFormState = useCallback(() => {
    setStep("phone");
    setOtpSent(false);
    setPhoneNumber("");
    setCountryCode(getDefaultCountryCode(storeCode));
    setOtp("");
    setIsLoading(false);
    setError("");
    setCountdown(60);
    setCanResend(false);
    setInputStates(["empty", "empty", "empty", "empty", "empty"]);
    setIsVerifying(false);
    setResendMethod(null);
    setVerificationSuccess(false);
    setHasValidationError(false);
    setFormattedPhoneNumber("");
    setHasBeenFocused(false);
    setAccounts([]);
    setSelectedEmail("");
    setIsKeyboardOpen(false);
  }, [storeCode]);

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

  // Detect keyboard visibility on mobile
  useEffect(() => {
    const initialViewportHeight = window.innerHeight;

    const handleResize = () => {
      const currentViewportHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentViewportHeight;

      // If viewport height decreased by more than 150px, assume keyboard is open
      setIsKeyboardOpen(heightDifference > 150);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setHasBeenFocused(false);
  }, [step]);

  useEffect(() => {
    if (isLogin) {
      resetFormState();
    }
  }, [isLogin, resetFormState]);

  const handleSendOtp = async () => {
    if (step === "phone") {
      if (!phoneNumber.trim()) {
        setHasValidationError(true);
        return;
      }

      if (!isValidPhoneNumber(phoneNumber, countryCode, storeCode)) {
        setHasValidationError(true);
        return;
      }

      // Track login_attempt event when user tries to login (sends OTP)
      trackLoginAttempt();
    }

    if (step === "otp" && (!canResend || isLoading || verificationSuccess)) {
      return;
    }

    setIsLoading(true);
    setError("");
    if (step === "otp") {
      setResendMethod("text");
    }

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

        if (step === "phone") {
          setOtpSent(true);
          setStep("otp");
        }
        setCountdown(60);
        setCanResend(false);
        setOtp("");
        setInputStates(["empty", "empty", "empty", "empty", "empty"]);
        setError("");
        setVerificationSuccess(false);
        showResend(
          (tToast as any)("send.message"),
          (tToast as any)("send.description"),
          "top"
        );
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
            setStep("email-selection");
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

          clearSuppressRegistration();

          const customer = await queryClient.fetchQuery(
            getCustomerQueryConfig(locale)
          );

          // Track login event with user data
          trackLogin(buildUserPropertiesFromCustomer(customer));

          setVerificationSuccess(true);
          toast({
            description: tToast("success.description"),
            title: (tToast as any)("success.message", { name: "Omar" }),
            type: "success",
          });

          // Get redirect URL or default to account/profile
          let navigateTo: string = getPostLoginRedirectUrl(searchParams);

          // If no redirect URL, default based on user profile completion
          if (navigateTo === ROUTES.CUSTOMER.ACCOUNT && !customer?.firstName) {
            navigateTo = ROUTES.CUSTOMER.PROFILE.ROOT;
            router.replace(navigateTo);
          } else {
            router.back();
          }
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
      }
    } catch (error) {
      console.error(error);
      // API/network failure during verify
      trackOtpError({
        action: "verify",
        error: t("errors.generalError"),
        phone: formatPhoneForAnalytics(countryCode, phoneNumber),
        source,
      });

      setError(t("errors.generalError"));
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
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
        setVerificationSuccess(false);
        showResend(
          tToast("resend.message"),
          tToast("resend.description"),
          "top"
        );
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

  const handleAccountSelection = async () => {
    if (!selectedEmail) return;

    setIsLoading(true);

    try {
      // Find the selected account's user_id
      const selectedAccount = accounts.find(
        (account) => account.email === selectedEmail
      );

      if (!selectedAccount) {
        showSuccess("Account not found", undefined, "top");
        return;
      }

      // Make API call to select account
      const result = await selectAccount({
        customerId: selectedAccount.user_id,
        mobile: `${countryCode}${phoneNumber}`,
        otp,
        storeCode,
      });

      if (result.success && result.data) {
        // Save token if provided
        if (result.data.token) {
          const cookieOptions = {
            expires: 7,
            sameSite: "Lax" as const,
            secure: process.env.NODE_ENV === "production",
          };
          Cookies.set("auth_token", result.data.token, cookieOptions);
        }

        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CART.ROOT(locale),
        });

        const customer = await queryClient.fetchQuery(
          getCustomerQueryConfig(locale)
        );

        // Track login event with user data
        // Track login event with user data
        trackLogin(buildUserPropertiesFromCustomer(customer));

        // Show success message
        toast({
          title: (tToast as any)("success.message", { name: "User" }),
          type: "success",
        });

        // Authorize user and redirect
        try {
          authorize();
        } catch (error) {
          console.warn("Error in authorize():", error);
        }

        // Clear suppress registration flag after successful login
        clearSuppressRegistration();

        let navigateTo: string = getPostLoginRedirectUrl(searchParams);

        // If no redirect URL, default based on user profile completion
        if (navigateTo === ROUTES.CUSTOMER.ACCOUNT && !customer?.firstName) {
          navigateTo = ROUTES.CUSTOMER.PROFILE.ROOT;
          router.replace(navigateTo);
        } else {
          router.back();
        }
      } else {
        showSuccess(
          result.error || "Failed to select account",
          undefined,
          "top"
        );
      }
    } catch (error) {
      console.error("Error selecting account:", error);
      showSuccess("Failed to select account", undefined, "top");
    } finally {
      setIsLoading(false);
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
        setVerificationSuccess(false);
        showResend(
          tToast("resend.message"),
          tToast("resend.description"),
          "top",
          30000
        );
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

  return (
    <div className="overflow-y-auto bg-white lg:hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
        <div className="flex items-center space-x-3">
          <button
            className="flex items-center"
            onClick={() => {
              if (step === "otp") {
                setStep("phone");
                setOtp("");
                setInputStates(["empty", "empty", "empty", "empty", "empty"]);
                setError("");
                setIsVerifying(false);
                setResendMethod(null);
                setVerificationSuccess(false);
              } else if (step === "email-selection") {
                setStep("otp");
                setError("");
                setAccounts([]);
                setSelectedEmail("");
              } else {
                router.back();
              }
            }}
          >
            <Image
              alt="arrow-back"
              className="rtl:rotate-180"
              height={24}
              src={ArrowBack}
              width={24}
            ></Image>
          </button>
          <h1 className="mx-3 text-xl font-medium text-gray-900">
            {step === "email-selection"
              ? t("emailSelection.pageTitle")
              : t("title")}
          </h1>
        </div>
        <Link href={ROUTES.CUSTOMER_SERVICE}>
          <Image
            alt="customer service"
            className="h-5 w-5"
            height={20}
            src={CustomerServiceIcon}
            width={20}
          />
        </Link>
      </div>

      <div
        className={`${step === "email-selection" ? "px-5 pt-5" : "p-5"} ${isKeyboardOpen ? "pb-2" : ""}`}
      >
        {step === "phone" ? (
          <>
            {/* Greeting */}
            <div className="mb-8">
              <h2 className="text-3xl font-normal text-gray-900">
                {t("greeting")}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {t("phoneStep.description")}
              </p>
            </div>

            {/* Phone Input */}
            <div className="mb-6">
              <div className="flex h-[50px] gap-2 rtl:flex-row-reverse">
                {/* Country Code Field */}
                <div className="flex h-[50px] w-[120px] items-center rounded-xl bg-gray-100 px-3 rtl:flex-row-reverse">
                  <span className="flex h-[20px] w-[30px] items-center">
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
                      className="w-[60px] bg-[#FAFAFA] text-lg font-normal outline-none rtl:ml-2"
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
                      className="text-lg font-normal text-gray-700 rtl:ml-2"
                      dir="ltr"
                    >
                      {countryCode}
                    </span>
                  )}
                </div>

                {/* Phone Number Field */}
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
                    className={`relative flex h-[50px] items-center rounded-xl bg-[#FAFAFA] px-4 py-6 text-gray-300 ${
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
                      className="w-full flex-1 border-none bg-transparent text-lg font-medium text-gray-700 outline-none placeholder:text-gray-300"
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
                        const numericValue = pastedText.replace(/[^0-9]/g, "");
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

                    {isValidPhoneNumber(phoneNumber, countryCode, storeCode) &&
                      !hasValidationError &&
                      !isGlobalStore(storeCode) && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 transform rtl:left-3">
                          <div className="flex h-3 w-3 items-center justify-center rounded-full bg-green-500">
                            <span className="text-[8px] text-white">✓</span>
                          </div>
                        </div>
                      )}
                    {(phoneNumber.length < getPhoneNumberLength(countryCode) ||
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

            <p className="mb-12 text-sm text-gray-500">
              {t("phoneStep.otpDescription")}
            </p>

            <button
              className="h-[50px] w-full rounded-xl bg-gray-700 text-center text-lg font-normal text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
              onClick={handleSendOtp}
            >
              {isLoading
                ? t("phoneStep.sendingButton")
                : t("phoneStep.sendButton")}
            </button>

            <AuthLegalConsent className="mt-5" />
          </>
        ) : step === "otp" ? (
          <>
            <div className="mt-2">
              {otpSent ? (
                <>
                  {/* Greeting */}
                  <div className="mb-10">
                    <h2 className="text-3xl font-normal text-gray-900">
                      {t("greeting")}
                    </h2>
                    <p className="mt-2 w-[340px] text-sm text-gray-600">
                      {t("otpStep.description")}{" "}
                      <span
                        className="inline-block whitespace-nowrap font-medium text-gray-800 underline"
                        dir="ltr"
                      >
                        {countryCode}&nbsp;{formattedPhoneNumber}
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
                          setResendMethod(null);
                          setVerificationSuccess(false);
                        }}
                      >
                        ✏️
                      </button>
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-center">
                      <div className="flex gap-2 rtl:flex-row-reverse">
                        {[0, 1, 2, 3, 4].map((index) => {
                          const currentValue = otp[index] || "";
                          const isEmpty = !currentValue;
                          const isFilled = !!currentValue;

                          let inputClass =
                            "h-13 w-13 rounded-xl text-center text-lg font-semibold transition-all duration-200 focus:outline-none ";

                          if (isVerifying) {
                            inputClass +=
                              "border-2 border-blue-500 bg-blue-50 text-blue-700 animate-pulse cursor-not-allowed";
                          } else if (isLoading) {
                            inputClass +=
                              "border-2 border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed";
                          } else if (verificationSuccess) {
                            inputClass +=
                              "border-2 border-green-500 bg-green-100 text-green-800 animate-pulse";
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
                              disabled={isLoading}
                              inputMode="numeric"
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
                                // Only allow numeric characters
                                const numericValue = e.target.value.replace(
                                  /[^0-9]/g,
                                  ""
                                );

                                const newOtp = otp.split("");
                                newOtp[index] = numericValue;
                                const finalOtp = newOtp.join("");
                                setOtp(finalOtp);
                                const newStates = [...inputStates];
                                newStates[index] = numericValue
                                  ? "filled"
                                  : "empty";
                                setInputStates(newStates);

                                if (numericValue && index < 4) {
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

                                if (
                                  value.length === 5 &&
                                  /^\d{5}$/.test(value)
                                ) {
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
                                  const prevInput = e.currentTarget
                                    .parentElement?.children[
                                    index - 1
                                  ] as HTMLInputElement;
                                  prevInput?.focus();
                                }
                              }}
                              onKeyPress={(e) => {
                                // Only allow numeric characters
                                if (!/[0-9]/.test(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              onPaste={(e) => {
                                e.preventDefault();

                                // Try multiple methods to get clipboard data for Safari compatibility
                                let pastedData = "";

                                if (e.clipboardData) {
                                  pastedData =
                                    e.clipboardData.getData("text/plain") ||
                                    e.clipboardData.getData("text") ||
                                    e.clipboardData.getData("Text");
                                }

                                // Extract only numeric characters
                                const numericData = pastedData.replace(
                                  /\D/g,
                                  ""
                                );

                                if (numericData.length >= 5) {
                                  // Take only first 5 digits
                                  const otpCode = numericData.slice(0, 5);
                                  const otpArray = otpCode.split("");
                                  setOtp(otpCode);

                                  const newStates = otpArray.map(
                                    () => "filled" as const
                                  );
                                  setInputStates(newStates);

                                  // Clear error state
                                  setError("");

                                  trackVerificationSmsDetected({
                                    phone: formatPhoneForAnalytics(
                                      countryCode,
                                      phoneNumber
                                    ),
                                  });
                                  setTimeout(() => {
                                    handleVerifyOtp(otpCode);
                                  }, 100);
                                } else if (numericData.length > 0) {
                                  // Handle partial paste (less than 5 digits)
                                  const currentOtpArray = otp.split("");
                                  const pasteLength = Math.min(
                                    numericData.length,
                                    5 - index
                                  );

                                  for (let i = 0; i < pasteLength; i++) {
                                    if (index + i < 5) {
                                      currentOtpArray[index + i] =
                                        numericData[i];
                                    }
                                  }

                                  const newOtp = currentOtpArray.join("");
                                  setOtp(newOtp);

                                  const newStates = currentOtpArray.map(
                                    (digit) =>
                                      digit
                                        ? ("filled" as const)
                                        : ("empty" as const)
                                  );
                                  setInputStates(newStates);

                                  // Focus next empty input
                                  const nextEmptyIndex =
                                    currentOtpArray.findIndex(
                                      (digit, i) => !digit && i > index
                                    );
                                  if (nextEmptyIndex !== -1) {
                                    const nextInput = e.currentTarget
                                      .parentElement?.children[
                                      nextEmptyIndex
                                    ] as HTMLInputElement;
                                    nextInput?.focus();
                                  }
                                }
                              }}
                              pattern="[0-9]*"
                              type="text"
                              value={currentValue}
                            />
                          );
                        })}
                      </div>
                    </div>
                    {isVerifying ? (
                      <OtpVerificationFeedback
                        className="my-4"
                        variant="page"
                      />
                    ) : null}
                    {/* Countdown Timer */}
                    {!isVerifying && countdown > 0 && (
                      <div className="font-lg mx-13 text-right font-normal text-orange-500">
                        {Math.floor(countdown / 60)
                          .toString()
                          .padStart(2, "0")}
                        :{(countdown % 60).toString().padStart(2, "0")}
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="text-center">
                      <p className="mb-4 text-sm text-gray-600">
                        {t("otpStep.resendText")}{" "}
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
                      </p>
                    </div>

                    <div className="flex justify-center gap-2 rtl:flex-row-reverse">
                      <button
                        className="relative flex items-center justify-center rounded-2xl bg-green-100 transition-all duration-200 hover:scale-105 hover:bg-green-200 active:scale-95 disabled:opacity-50"
                        disabled={
                          !canResend || isLoading || verificationSuccess
                        }
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
                        disabled={
                          !canResend || isLoading || verificationSuccess
                        }
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
                  </div>

                  {error && (
                    <div className="mb-4 text-center text-sm text-red-600">
                      {error}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600">
                    {t("phoneStep.sendingButton")} {countryCode} {phoneNumber}
                    ...
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Email Selection Step */}
            <div className="flex min-h-[calc(100vh-200px)] flex-col">
              <div className="flex-1">
                <div className="to-white-50 mb-6 flex h-[82px] items-center justify-center rounded-xl bg-blue-50 bg-gradient-to-r from-blue-200 p-4">
                  <div className="flex items-center">
                    <Image
                      alt="info"
                      height={30}
                      src={InformativeIcon}
                      width={30}
                    />
                    <div className="p-3">
                      <h3 className="text-base font-semibold text-gray-900">
                        {t("emailSelection.title")}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t("emailSelection.description")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {accounts.map((account, index) => (
                    <div
                      className="flex items-center space-x-3 rounded-lg py-3 shadow-[0_1px_1px_0_#F3F3F3]"
                      key={account.user_id}
                    >
                      <label
                        className="mx-1 flex-1 cursor-pointer truncate text-lg font-medium text-gray-700"
                        dir="ltr"
                        htmlFor={`email-${index}`}
                        title={account.email}
                      >
                        {account.email}
                      </label>
                      <input
                        checked={selectedEmail === account.email}
                        className="h-5 w-5 appearance-none rounded-full border-2 border-gray-300 bg-white checked:border-[#6543F5] checked:bg-[#6543F5] focus:outline-none focus:ring-2 focus:ring-[#6543F5] focus:ring-offset-2"
                        id={`email-${index}`}
                        name="defaultEmail"
                        onChange={(e) => setSelectedEmail(e.target.value)}
                        type="radio"
                        value={account.email}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom section with warning and button */}
              <div className="mt-auto space-y-4">
                <div className="rounded-lg">
                  <div className="flex items-center">
                    <div className="mx-2 text-yellow-600">
                      <Image
                        alt="warning"
                        height={16}
                        src={AlertIcon}
                        width={16}
                      />
                    </div>
                    <p className="text-xs text-[#5D5D5D]">
                      {t("emailSelection.warning")}
                    </p>
                  </div>
                </div>

                <button
                  className="h-[50px] w-full rounded-xl bg-gray-700 text-center text-lg font-normal text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!selectedEmail || isLoading}
                  onClick={handleAccountSelection}
                >
                  {t("emailSelection.confirmButton")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
