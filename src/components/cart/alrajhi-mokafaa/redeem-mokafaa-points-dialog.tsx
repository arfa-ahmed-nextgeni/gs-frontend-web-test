"use client";

import { useState } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import CloseIcon from "@/assets/icons/close-icon.svg";
import PlusIcon from "@/assets/icons/plus-icon.svg";
import VectorIcon from "@/assets/icons/vector-icon.svg";
import { MokafaaViewExpandedTracker } from "@/components/analytics/mokafaa-view-expanded-tracker";
import { ApplyMokafaaPointsOtpForm } from "@/components/cart/alrajhi-mokafaa/apply-mokafaa-points-otp-form";
import { InputMokafaaNumberForm } from "@/components/cart/alrajhi-mokafaa/input-mokafaa-number-form";
import { RemoveMokafaaPointsConfirmationDialog } from "@/components/cart/alrajhi-mokafaa/remove-mokafaa-points-confirmation-dialog";
import {
  CouponRow,
  RotatingIcon,
} from "@/components/cart/order/order-summary/order-summary-helpers";
import { LocalizedPrice } from "@/components/shared/localized-price";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { trackMokafaaEditPhoneNumber } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils/price";

interface OtpRequestedData {
  countryCode: string;
  mobileNumber: string;
  otpToken: string;
}

// Format phone number for display (e.g., "50 123 4567")
const formatPhoneNumberForDisplay = (number: string) => {
  if (number.length <= 2) return number;
  if (number.length <= 5) return `${number.slice(0, 2)} ${number.slice(2)}`;
  return `${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
};

type RedeemMokafaaPointsDialogProps = {
  mokafaaDiscount?: number;
  redeemMokafaaDisabled: boolean;
};

export const RedeemMokafaaPointsDialog = ({
  mokafaaDiscount,
  redeemMokafaaDisabled,
}: RedeemMokafaaPointsDialogProps) => {
  const t = useTranslations("CartPage.orderSummary.mokafaa");
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<"otp" | "phone">("phone");
  const [otpData, setOtpData] = useState<null | OtpRequestedData>(null);

  const handleOtpRequested = (data: OtpRequestedData) => {
    setOtpData(data);
    setCurrentStep("otp");
  };

  const handleEditPhone = () => {
    // Track mokafaa_edit_phone_number when user edits phone number
    trackMokafaaEditPhoneNumber();
    setCurrentStep("phone");
  };

  const handleOtpTokenUpdated = (newOtpToken: string) => {
    if (otpData) {
      setOtpData({
        ...otpData,
        otpToken: newOtpToken,
      });
    }
  };

  const closeDialog = () => {
    setOpen(false);
    setCurrentStep("phone");
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    // Keep otpData when closing so old OTP can still be reused
    // if backend returns "OTP is still valid" on next open.
    if (!isOpen) {
      setCurrentStep("phone");
    }
  };

  // --- Disabled ---
  if (redeemMokafaaDisabled) {
    return (
      <CouponRow
        disabled
        label={t.rich("trigger", {
          b: (c) => <span className="font-semibold rtl:font-bold">{c}</span>,
        })}
        labelClasses="text-text-muted cursor-not-allowed"
        leftIcon={VectorIcon}
        right={<></>}
      />
    );
  }

  // --- Already applied ---
  if (mokafaaDiscount) {
    return (
      <CouponRow
        disabled
        label={t.rich("applied", {
          b: (c) => <span className="font-semibold rtl:font-bold">{c}</span>,
          points: () => (
            <LocalizedPrice
              price={formatPrice({
                amount: mokafaaDiscount,
                currencyCode: "SAR",
              })}
            />
          ),
        })}
        labelClasses="text-btn-bg-teal"
        leftIcon={VectorIcon}
        right={<RemoveMokafaaPointsConfirmationDialog />}
      />
    );
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <MokafaaViewExpandedTracker isDialogOpen={open} />
      {/* Trigger */}
      <DialogTrigger asChild>
        <CouponRow
          label={t.rich("trigger", {
            b: (c) => <span className="font-semibold rtl:font-bold">{c}</span>,
          })}
          leftIcon={VectorIcon}
          right={
            <RotatingIcon
              active={open}
              activeSrc={CloseIcon}
              inactiveSrc={PlusIcon}
              size={18}
            />
          }
        />
      </DialogTrigger>

      {/* ===========================
          MOBILE VERSION (Bottom Sheet)
        =========================== */}
      {isMobile ? (
        <DialogContent
          className={cn(
            "translate-none bottom-0 left-0 top-auto w-full max-w-full gap-0 rounded-none p-0"
          )}
          showCloseButton={false}
        >
          {/* Header */}
          <DialogHeader className="py-3.75 border-border-base flex flex-row items-center justify-between border-b px-5">
            <DialogTitle className="text-text-primary text-xl font-medium">
              {t("title")}
            </DialogTitle>

            <DialogClose>
              <Image alt="close" className="size-5" src={CloseIcon} />
            </DialogClose>
          </DialogHeader>

          {/* Body */}
          <div className="flex flex-col overflow-y-auto px-5 pb-5">
            <DialogDescription className="text-text-tertiary mb-2 mt-5 text-sm">
              {currentStep === "phone" ? (
                t("description")
              ) : (
                <>
                  {otpData ? (
                    <span className="block lg:inline">
                      {t.rich("otpDescription", {
                        phoneNumber: () => (
                          <>
                            <span
                              className="inline-flex gap-1 font-medium text-gray-800 underline"
                              dir="ltr"
                            >
                              <span>{otpData.countryCode}</span>
                              <span>
                                {formatPhoneNumberForDisplay(
                                  otpData.mobileNumber
                                )}
                              </span>
                            </span>
                            <button
                              className="ml-1 lg:ml-2"
                              onClick={(e) => {
                                e.preventDefault();
                                handleEditPhone();
                              }}
                              type="button"
                            >
                              ✏️
                            </button>
                          </>
                        ),
                      })}
                    </span>
                  ) : (
                    <span className="block lg:inline">
                      {t("otpDescription")}
                    </span>
                  )}
                </>
              )}
            </DialogDescription>

            {currentStep === "phone" ? (
              <InputMokafaaNumberForm
                initialOtpToken={otpData?.otpToken}
                initialPhoneValue={
                  otpData
                    ? {
                        countryCode: otpData.countryCode,
                        number: otpData.mobileNumber,
                      }
                    : undefined
                }
                onOtpRequested={handleOtpRequested}
                onSuccess={closeDialog}
              />
            ) : (
              otpData && (
                <ApplyMokafaaPointsOtpForm
                  countryCode={otpData.countryCode}
                  mobileNumber={otpData.mobileNumber}
                  onOtpTokenUpdated={handleOtpTokenUpdated}
                  onSuccess={closeDialog}
                  otpToken={otpData.otpToken}
                />
              )
            )}
          </div>
        </DialogContent>
      ) : (
        /* ===========================
           WEB VERSION
        =========================== */
        <DialogContent
          className={cn(
            "p-7.5 flex flex-col rounded-[20px] bg-white",
            "w-full max-w-full lg:w-[400px]"
          )}
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle className="text-text-primary mt-3 text-[35px] font-normal">
              {t("title")}
            </DialogTitle>

            <DialogDescription className="text-text-tertiary mb-2 text-sm">
              {currentStep === "phone" ? (
                t("description")
              ) : (
                <>
                  {otpData ? (
                    <>
                      {t.rich("otpDescription", {
                        phoneNumber: () => (
                          <>
                            <span
                              className="inline-flex gap-1 font-medium text-gray-800 underline"
                              dir="ltr"
                            >
                              <span>{otpData.countryCode}</span>
                              <span>
                                {formatPhoneNumberForDisplay(
                                  otpData.mobileNumber
                                )}
                              </span>
                            </span>{" "}
                            <button
                              className="ml-2 text-gray-600 underline hover:text-gray-800"
                              onClick={(e) => {
                                e.preventDefault();
                                handleEditPhone();
                              }}
                              type="button"
                            >
                              ✏️
                            </button>
                          </>
                        ),
                      })}
                    </>
                  ) : (
                    <>{t("otpDescription")}</>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {currentStep === "phone" ? (
            <InputMokafaaNumberForm
              initialOtpToken={otpData?.otpToken}
              initialPhoneValue={
                otpData
                  ? {
                      countryCode: otpData.countryCode,
                      number: otpData.mobileNumber,
                    }
                  : undefined
              }
              onOtpRequested={handleOtpRequested}
              onSuccess={closeDialog}
            />
          ) : (
            otpData && (
              <ApplyMokafaaPointsOtpForm
                countryCode={otpData.countryCode}
                mobileNumber={otpData.mobileNumber}
                onOtpTokenUpdated={handleOtpTokenUpdated}
                onSuccess={closeDialog}
                otpToken={otpData.otpToken}
              />
            )
          )}
        </DialogContent>
      )}
    </Dialog>
  );
};
