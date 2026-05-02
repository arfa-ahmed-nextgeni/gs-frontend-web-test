"use client";

import Image from "next/image";

import { useTranslations } from "next-intl";

import KSALogo from "@/assets/logos/ksa-na-logo.svg";
import { AddDeliveryAddressSaveForm } from "@/components/checkout/add-delivery-address/add-delivery-address-save-form";
import { useAddDeliveryAddressContext } from "@/contexts/add-delivery-address-context";
import { cn } from "@/lib/utils";

interface AddDeliveryAddressStepsProps {
  setShowSaveForm: (show: boolean) => void;
  showSaveForm: boolean;
}

export const AddDeliveryAddressSteps = ({
  setShowSaveForm,
  showSaveForm,
}: AddDeliveryAddressStepsProps) => {
  const t = useTranslations("AddDeliveryAddressPage.steps");
  const {
    editingAddressId,
    initialAddressSnapshot,
    initialSelectedLocation,
    isSelectedLocationInSaudiArabia,
    selectedAddress,
    selectedLocation,
    setIsManualEntryMode,
  } = useAddDeliveryAddressContext();
  const shouldUseSavedAddress =
    !!editingAddressId &&
    !!initialSelectedLocation &&
    !!selectedLocation &&
    selectedLocation.lat === initialSelectedLocation.lat &&
    selectedLocation.lng === initialSelectedLocation.lng;
  const displayedAddress =
    shouldUseSavedAddress && initialAddressSnapshot?.formattedAddress
      ? initialAddressSnapshot.formattedAddress
      : selectedAddress;

  const isConfirmDisabled =
    !displayedAddress || isSelectedLocationInSaudiArabia === false;

  const handleConfirmAddress = async () => {
    if (isConfirmDisabled) {
      return;
    }

    setIsManualEntryMode(false);
    // Show the save form instead of proceeding directly
    setShowSaveForm(true);
  };

  const handleEnterAddressManually = () => {
    setIsManualEntryMode(true);
    setShowSaveForm(true);
  };

  // Show save form if requested
  if (showSaveForm) {
    return <AddDeliveryAddressSaveForm />;
  }

  return (
    <div className="flex flex-col bg-white">
      {/* Bottom Action Area */}
      <div className="space-y-4 p-5">
        {/* Selected Address Display */}
        <div className="flex items-start gap-3 rounded-lg border border-[#D9D9D9] bg-gray-50 p-4">
          <Image
            alt="Saudi Arabia"
            className="mt-0.5 size-6 flex-shrink-0"
            height={24}
            src={KSALogo}
            width={24}
          />
          <div className="min-w-0 flex-1">
            <p className="break-words text-sm leading-relaxed text-gray-900">
              {displayedAddress || t("selectAddressFromMap")}
            </p>
          </div>
        </div>

        <button
          className={cn(
            "h-[50px] w-full rounded-[12px] text-[16px] font-medium text-white transition",
            isConfirmDisabled
              ? "cursor-not-allowed bg-[#B5B8C1]"
              : "bg-[#374957] hover:bg-[#374957]/90"
          )}
          disabled={isConfirmDisabled}
          onClick={handleConfirmAddress}
          type="button"
        >
          {t("confirmDeliveryAddress")}
        </button>

        <div className="text-center">
          <button
            className="text-[16px] font-medium text-[#374957] underline transition hover:no-underline"
            onClick={handleEnterAddressManually}
            type="button"
          >
            {t("enterAddressManually")}
          </button>
        </div>
      </div>
    </div>
  );
};
