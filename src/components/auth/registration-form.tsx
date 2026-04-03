"use client";

import React, { useCallback, useEffect, useState } from "react";

import Image from "next/image";

import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import ErrorIcon from "@/assets/icons/Error.svg";
import { useToastContext } from "@/components/providers/toast-provider";
import { getCustomerQueryConfig } from "@/hooks/queries/use-customer-query";
import { useRouteMatch } from "@/hooks/use-route-match";
import { updateCustomer } from "@/lib/actions/auth/update-customer";
import {
  setUserPropertiesFromCustomer,
  trackEditProfile,
  trackSignup,
} from "@/lib/analytics/events";
import { buildUserPropertiesFromCustomer } from "@/lib/analytics/utils/build-properties";
import { Locale, StoreCode } from "@/lib/constants/i18n";

interface RegistrationData {
  email: string;
  firstName: string;
  lastName: string;
}

interface RegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RegistrationData) => void;
  storeCode: StoreCode;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  storeCode,
}) => {
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;
  const { isCheckout } = useRouteMatch();
  const t = useTranslations("HomePage.header.registrationForm");
  const { showError, showSuccess } = useToastContext();
  const tToast = useTranslations("Toast");
  const [formData, setFormData] = useState<RegistrationData>({
    email: "",
    firstName: "",
    lastName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<null | string>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [hasBeenFocused, setHasBeenFocused] = useState<{
    [key: string]: boolean;
  }>({});

  // Reset form function
  const resetForm = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
    });
    setFocusedField(null);
    setErrors({});
    setHasBeenFocused({});
  };

  // Auto-reset form when opened
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, isCheckout]);

  const handleClose = useCallback(async () => {
    trackSignup();
    onClose();
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName.trim() &&
      !formData.lastName.trim() &&
      !formData.email.trim()
    ) {
      return;
    }

    // Validate email format
    const emailError = validateField("email", formData.email);
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }

    setIsLoading(true);

    try {
      const authToken = Cookies.get("auth_token");

      if (!authToken) {
        await onSubmit(formData);
        return;
      }
      const result = await updateCustomer({
        input: {
          ...(formData.email.trim() && { email: formData.email.trim() }),
          ...(formData.firstName.trim() && {
            firstname: formData.firstName.trim(),
          }),
          ...(formData.lastName.trim() && {
            lastname: formData.lastName.trim(),
          }),
          password: true, // Set password to true as per the mutation
        },
        storeCode,
      });

      if (result.success) {
        const customer = await queryClient.fetchQuery(
          getCustomerQueryConfig(locale)
        );

        if (customer) {
          setUserPropertiesFromCustomer(customer);
        }

        // Track signup event with user data
        trackSignup(buildUserPropertiesFromCustomer(customer));
        trackEditProfile(buildUserPropertiesFromCustomer(customer));

        showSuccess(
          (tToast as any)("updateSuccessToast"),
          (tToast as any)("updateSuccessToast"),
          "bottom"
        );
        await onSubmit(formData);
      } else {
        const apiMessage = result.error?.replace(/\.$/, "") || "";
        showError(
          tToast.has(apiMessage as any)
            ? tToast(apiMessage as any)
            : tToast("updateErrorToast"),
          " "
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      showError(tToast("updateErrorToast"), " ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateField = (
    field: keyof RegistrationData,
    value: string
  ): string => {
    if (field === "email" && value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
    }

    return "";
  };

  const handleBlur = (field: keyof RegistrationData) => {
    setFocusedField(null);
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleFocus = (field: keyof RegistrationData) => {
    setFocusedField(field);
    setHasBeenFocused((prev) => ({ ...prev, [field]: true }));
  };

  // Helper function to check if form can be submitted
  const canSubmit = () => {
    const hasAtLeastOneField =
      formData.firstName.trim() ||
      formData.lastName.trim() ||
      formData.email.trim();

    const emailIsValid =
      !formData.email.trim() || validateField("email", formData.email) === "";

    return hasAtLeastOneField && emailIsValid;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-[400px] rounded-3xl bg-white px-6 py-6 shadow-xl">
        {/* Close Button */}
        <button
          className="absolute right-6 top-6 text-[#374957] hover:text-gray-600"
          onClick={handleClose}
        >
          <X size={20} />
        </button>

        {/* Header Section */}
        <div className="mb-10 mt-10">
          <h2 className="mb-5 text-4xl font-normal text-gray-700">
            {t("title")}
          </h2>
          <p className="mb-1 text-sm text-gray-600">{t("successMessage")}</p>
          <p className="text-sm text-gray-600">{t("completeProfileMessage")}</p>
        </div>

        {/* Registration Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name Fields */}
          <div className="flex w-[340px] gap-2.5">
            <div className="flex-1">
              <div className="relative w-[165px]">
                {(focusedField === "firstName" ||
                  (hasBeenFocused.firstName &&
                    formData.firstName.length > 0)) && (
                  <div className="absolute -top-3 left-0 right-0 z-10 flex items-center px-4">
                    <div className="bg-white px-2">
                      <label
                        className={`text-xs font-normal ${
                          focusedField === "firstName"
                            ? "text-gray-400"
                            : "text-gray-400"
                        }`}
                      >
                        {t("firstNamePlaceholder")}
                      </label>
                    </div>
                  </div>
                )}
                <div
                  className={`relative flex h-[50px] w-[165px] items-center rounded-xl bg-[#FAFAFA] text-gray-300 ${
                    focusedField === "firstName" ||
                    (hasBeenFocused.firstName && formData.firstName.length > 0)
                      ? "border-2 border-gray-300"
                      : "border-2 border-transparent hover:border-gray-300"
                  }`}
                >
                  <input
                    className="w-[165px] bg-transparent px-4 text-lg font-medium text-gray-700 placeholder-[#BDC2C5] outline-none"
                    onBlur={() => handleBlur("firstName")}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    onFocus={() => handleFocus("firstName")}
                    placeholder={
                      focusedField === "firstName"
                        ? ""
                        : t("firstNamePlaceholder")
                    }
                    type="text"
                    value={formData.firstName}
                  />
                </div>
              </div>
            </div>
            <div className="w-[165px] flex-1">
              <div className="relative">
                {(focusedField === "lastName" ||
                  (hasBeenFocused.lastName &&
                    formData.lastName.length > 0)) && (
                  <div className="absolute -top-3 left-0 right-0 z-10 flex items-center px-4">
                    <div className="bg-white px-2">
                      <label
                        className={`text-xs font-normal ${
                          focusedField === "lastName"
                            ? "text-gray-400"
                            : "text-gray-400"
                        }`}
                      >
                        {t("lastNamePlaceholder")}
                      </label>
                    </div>
                  </div>
                )}
                <div
                  className={`relative flex h-[50px] w-[165px] items-center rounded-xl bg-[#FAFAFA] text-gray-300 ${
                    focusedField === "lastName" ||
                    (hasBeenFocused.lastName && formData.lastName.length > 0)
                      ? "border-2 border-gray-300"
                      : "border-2 border-transparent hover:border-gray-300"
                  }`}
                >
                  <input
                    className="w-[165px] bg-transparent px-4 text-lg font-medium text-gray-700 placeholder-[#BDC2C5] outline-none"
                    onBlur={() => handleBlur("lastName")}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    onFocus={() => handleFocus("lastName")}
                    placeholder={
                      focusedField === "lastName"
                        ? ""
                        : t("lastNamePlaceholder")
                    }
                    type="text"
                    value={formData.lastName}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div>
            <div className="relative w-[340px]">
              {(focusedField === "email" ||
                (hasBeenFocused.email && formData.email.length > 0)) && (
                <div className="absolute -top-3 left-0 right-0 z-10 flex items-center px-4">
                  <div className="bg-white px-2">
                    <label
                      className={`text-xs font-normal ${
                        errors.email
                          ? "text-orange-500"
                          : focusedField === "email"
                            ? "text-gray-400"
                            : "text-gray-400"
                      }`}
                    >
                      {t("emailPlaceholder")}
                    </label>
                  </div>
                </div>
              )}
              <div
                className={`relative flex h-[50px] w-[340px] items-center rounded-xl bg-[#FAFAFA] px-4 py-6 text-gray-300 ${
                  errors.email
                    ? "border-2 border-orange-500"
                    : focusedField === "email"
                      ? "border-2 border-gray-300"
                      : "border-2 border-transparent hover:border-gray-300"
                }`}
              >
                <input
                  className="w-[165px] flex-1 bg-transparent text-lg font-medium text-gray-700 placeholder-[#BDC2C5] outline-none"
                  onBlur={() => handleBlur("email")}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onFocus={() => handleFocus("email")}
                  placeholder={
                    focusedField === "email" ? "" : t("emailPlaceholder")
                  }
                  type="email"
                  value={formData.email}
                />
                {errors.email && (
                  <Image
                    alt="Info icon"
                    className="h-4 w-4 pt-1"
                    height={12}
                    src={ErrorIcon}
                    width={12}
                  />
                )}
              </div>
              {errors.email && (
                <p className="absolute -bottom-5 left-0 right-0 text-right text-xs text-orange-500">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            className="mt-15 h-[50px] w-[340px] rounded-xl bg-slate-700 text-lg font-semibold tracking-wide text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || !canSubmit()}
            type="submit"
          >
            {isLoading ? t("completingButton") : t("completeProfileButton")}
          </button>
        </form>
      </div>
    </div>
  );
};
