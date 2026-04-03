"use client";

import Image from "next/image";

import { useTranslations } from "next-intl";

import EditIcon from "@/assets/icons/edit-icon.svg";
import GiftIcon from "@/assets/icons/Gift.svg";
import LockerAddressIcon from "@/assets/icons/locker-address-icon.svg";
import VerifiedIcon from "@/assets/icons/verified-icon.svg";
import HomeIcon from "@/components/icons/home-icon";
import { Spinner } from "@/components/ui/spinner";
import { useCheckoutContext } from "@/contexts/checkout-context";

import { CheckoutShippingAddressButton } from "./checkout-shipping-address-button";

export interface CustomerAddress {
  customerAddress?: {
    [key: string]: unknown;
    address_label?: string;
    countryCode?: string;
    countryLabel?: string;
    raw?: {
      [key: string]: unknown;
      address_label?: string;
    };
  };
  formattedAddress: string;
  id: string;
  isDefault?: boolean;
  lockerInfo?: {
    lockerAddress: string;
    lockerName: string;
    lockerType: string;
    pointName?: string;
  };
  name: string;
  phoneNumber: string;
}

interface CheckoutShippingAddressSectionProps {
  isLoading?: boolean;
  onAddAddress?: () => void;
  onEditAddress?: () => void;
  selectedAddress?: CustomerAddress | null;
}

export function CheckoutShippingAddressSection({
  isLoading = false,
  onAddAddress,
  onEditAddress,
  selectedAddress,
}: CheckoutShippingAddressSectionProps) {
  const t = useTranslations("CheckoutPage");

  const { selectedLockerAddressType } = useCheckoutContext();

  const formattedAddressWithCountry = (() => {
    if (!selectedAddress) return "";

    const countryName =
      selectedAddress.customerAddress?.countryLabel ??
      selectedAddress.customerAddress?.countryCode ??
      "";
    return countryName
      ? `${countryName}, ${selectedAddress.formattedAddress}`
      : selectedAddress.formattedAddress;
  })();

  // Determine if address is a gift address
  const isGiftAddress = (() => {
    if (!selectedAddress) return false;
    const addressLabel =
      (selectedAddress.customerAddress as any)?.address_label ||
      (selectedAddress.customerAddress as any)?.raw?.address_label ||
      "";
    return addressLabel?.toLowerCase() === "gift";
  })();

  // Get the correct phone number to display
  // For gift addresses, get the telephone from raw object
  // For regular addresses, use the phoneNumber field
  const displayPhoneNumber = (() => {
    if (!selectedAddress) return "";

    let phoneNumber = "";

    // Check if address is a gift address by looking at raw.address_label
    const rawData = (selectedAddress.customerAddress as any)?.raw;
    if (
      rawData?.address_label?.toLowerCase() === "gift" &&
      rawData?.telephone
    ) {
      phoneNumber = rawData.telephone;
    } else {
      // Default to phoneNumber field for regular addresses
      phoneNumber = selectedAddress.phoneNumber;
    }

    // Remove '+' if present at the beginning
    return phoneNumber.startsWith("+") ? phoneNumber.slice(1) : phoneNumber;
  })();

  const verificationValue =
    (selectedAddress?.customerAddress as any)?.is_ksa_verified ??
    (selectedAddress?.customerAddress as any)?.raw?.is_ksa_verified;
  const hasVerificationStatus = typeof verificationValue === "boolean";
  const isKsaVerified = verificationValue === true;

  return (
    <>
      <h2 className="text-text-primary text-xl font-medium lg:mt-5 lg:text-[25px] lg:font-semibold">
        {t("shippingAddress.title")}
      </h2>

      {isLoading ? (
        <section className="shadow-xs mb-2.5 overflow-hidden rounded-2xl bg-white lg:mb-0">
          <div className="flex flex-col gap-4 px-5 py-4 lg:p-5">
            <div className="flex items-center justify-center py-8">
              <Spinner size={24} variant="dark" />
            </div>
          </div>
        </section>
      ) : selectedAddress ? (
        <section className="shadow-xs mb-2.5 overflow-hidden rounded-2xl bg-white lg:mb-0">
          <div className="flex flex-col gap-4 px-5 py-4 lg:p-5">
            <div className="flex items-end justify-between gap-4">
              <div className="lg:gap-x-7.5 flex flex-col gap-y-2 text-xs lg:grid lg:gap-y-2 lg:text-base lg:[grid-template-columns:minmax(80px,auto)_1fr]">
                <span className="text-text-primary hidden text-xs font-normal lg:block">
                  {t("shippingAddress.nameLabel" as any)}
                </span>
                <span className="text-text-primary max-w-[calc(100vw-140px)] truncate text-xs font-normal lg:max-w-[350px]">
                  {selectedAddress.name}
                </span>

                {/* Show locker name separately if it's a locker address */}
                {selectedAddress.lockerInfo && (
                  <>
                    <span className="text-text-primary hidden text-xs font-normal lg:block">
                      {t("shippingAddress.lockerNameLabel" as any)}
                    </span>
                    <span className="text-text-primary max-w-[calc(100vw-140px)] break-words text-xs font-normal lg:max-w-[350px]">
                      {selectedAddress.lockerInfo.pointName
                        ? `${selectedAddress.lockerInfo.lockerName} - ${selectedAddress.lockerInfo.pointName}`
                        : selectedAddress.lockerInfo.lockerName}
                    </span>
                  </>
                )}

                <span className="text-text-primary hidden text-xs font-normal lg:block">
                  {t("shippingAddress.addressLabel" as any)}
                </span>
                <span className="text-text-primary max-w-[calc(100vw-140px)] break-words text-xs font-normal lg:max-w-[350px]">
                  {formattedAddressWithCountry}
                </span>

                <span className="text-text-primary hidden text-xs font-normal lg:block">
                  {t("shippingAddress.mobileLabel" as any)}
                </span>
                <span className="flex items-center justify-between gap-3">
                  <span
                    className="text-text-primary text-xs font-normal rtl:text-right"
                    dir="ltr"
                  >
                    +{displayPhoneNumber}
                  </span>
                  {hasVerificationStatus &&
                    (isKsaVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2563EB]">
                        <Image
                          alt={t("addressDrawer.verified" as any)}
                          className="shrink-0"
                          height={14}
                          src={VerifiedIcon}
                          width={14}
                        />
                        {t("addressDrawer.verified" as any)}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-[#F59E0B]">
                        {t("addressDrawer.notVerified" as any)}
                      </span>
                    ))}
                </span>
              </div>

              <div className="flex flex-col items-end gap-3">
                <span className="text-primary flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                  {isGiftAddress ? (
                    <Image
                      alt="Gift"
                      className="shrink-0"
                      height={15}
                      src={GiftIcon}
                      unoptimized
                      width={15}
                    />
                  ) : selectedLockerAddressType ? (
                    <Image
                      alt="Locker"
                      className="h-3.75 w-3.75"
                      height={15}
                      src={LockerAddressIcon}
                      unoptimized
                      width={15}
                    />
                  ) : (
                    <HomeIcon color="currentColor" height="15" width="15" />
                  )}
                </span>

                <button
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-2 text-xs font-medium rtl:flex-row-reverse"
                  onClick={onEditAddress ?? onAddAddress}
                  type="button"
                >
                  <Image
                    alt={t("shippingAddress.editAddress" as any)}
                    height={15}
                    priority
                    src={EditIcon}
                    unoptimized
                    width={15}
                  />
                  {t("shippingAddress.editAddress" as any)}
                </button>
              </div>
            </div>
          </div>

          <button
            className="text-text-primary hover:bg-bg-surface h-[45px] w-full border-t border-[#EEF0F2] text-center text-[20px] font-medium transition-colors duration-200"
            onClick={onAddAddress}
            type="button"
          >
            {t("shippingAddress.addOrChange" as any)}
          </button>
        </section>
      ) : (
        <section className="mb-2.5 lg:mb-0">
          <CheckoutShippingAddressButton onClick={onAddAddress} />
        </section>
      )}
    </>
  );
}
