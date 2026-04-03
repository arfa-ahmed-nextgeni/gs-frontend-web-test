"use client";

import React, { useState } from "react";

import Image from "next/image";

import Cookies from "js-cookie";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

import AlertIcon from "@/assets/icons/Alert.svg";
import InformativeIcon from "@/assets/icons/informative-icon.svg";
import { useToastContext } from "@/components/providers/toast-provider";
import { useUI } from "@/contexts/use-ui";
import { selectAccount } from "@/lib/actions/auth/otp";
import { StoreCode } from "@/lib/constants/i18n";

interface EmailSelectionPopupProps {
  accounts: Array<{ email: string; user_id: string }>;
  isOpen: boolean;
  mobile: string;
  onCloseAction: () => void;
  otp: string;
  storeCode: StoreCode;
}

export const EmailSelectionPopup: React.FC<EmailSelectionPopupProps> = ({
  accounts,
  isOpen,
  mobile,
  onCloseAction,
  otp,
  storeCode,
}) => {
  const { authorize } = useUI();
  const { showSuccess } = useToastContext();
  const t = useTranslations("HomePage.header.mobileOtpLogin.emailSelection");
  const tToast = useTranslations("Toast");

  const [selectedEmail, setSelectedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAccountSelection = async () => {
    if (!selectedEmail) return;

    setIsLoading(true);

    try {
      // Find the selected account's user_id
      const selectedAccount = accounts.find(
        (account) => account.email === selectedEmail
      );

      if (!selectedAccount) {
        showSuccess("Account not found", undefined, "bottom");
        return;
      }

      // Make API call to select account
      const result = await selectAccount({
        customerId: selectedAccount.user_id,
        mobile,
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

        // Show success message
        showSuccess(
          (tToast as any)("success.message", { name: "User" }),
          undefined,
          "bottom"
        );

        // Authorize user and close popup
        try {
          authorize();
        } catch (error) {
          console.warn("Error in authorize():", error);
        }

        setTimeout(() => {
          onCloseAction();
        }, 1500);
      } else {
        showSuccess(
          result.error || "Failed to select account",
          undefined,
          "bottom"
        );
      }
    } catch (error) {
      console.error("Error selecting account:", error);
      showSuccess("Failed to select account", undefined, "bottom");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedEmail("");
    onCloseAction();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-[400px] max-w-md rounded-2xl bg-white pt-0 shadow-xl">
        {/* Header with icon and title */}
        <div className="flex rounded-t-xl bg-blue-50 bg-gradient-to-r from-blue-200 to-white p-4">
          <div className="flex">
            <Image alt="info" height={30} src={InformativeIcon} width={30} />
            <div className="mx-3">
              <h3 className="text-base font-semibold text-gray-900">
                {t("title")}
              </h3>
              <p className="w-[260px] text-sm text-gray-600">
                {t("description")}
              </p>
            </div>
            {/* Close button */}
          </div>
          <button
            className="absolute top-8 text-gray-400 hover:text-gray-600 ltr:right-4 rtl:left-4"
            onClick={handleClose}
          >
            <X size={30} />
          </button>
        </div>

        <div className="p-6">
          {/* Email selection list */}
          <div className="mb-13 space-y-3">
            {accounts.map((account, index) => (
              <div
                className="flex h-[50px] items-center justify-between rounded-lg py-3 shadow-[0_1px_1px_0_#F3F3F3]"
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

          {/* Warning message */}
          <div className="mb-6 flex items-start rounded-lg">
            <div className="mx-2 mt-1">
              <Image alt="warning" height={12} src={AlertIcon} width={12} />
            </div>
            <p className="w-[390px] text-xs text-[#5D5D5D]">{t("warning")}</p>
          </div>

          {/* Confirm button */}
          <button
            className="h-[50px] w-[340px] rounded-xl bg-gray-700 text-center text-lg font-normal text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!selectedEmail || isLoading}
            onClick={handleAccountSelection}
          >
            {isLoading ? "Loading..." : t("confirmButton")}
          </button>
        </div>
      </div>
    </div>
  );
};
