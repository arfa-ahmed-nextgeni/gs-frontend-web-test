"use client";

import { MouseEvent, useEffect, useMemo, useState } from "react";

import Image from "next/image";

import { useLocale, useTranslations } from "next-intl";

import EditIcon from "@/assets/icons/edit-icon.svg";
import GiftIcon from "@/assets/icons/Gift.svg";
import TrashIcon from "@/assets/icons/trash-icon.svg";
import VerifiedIcon from "@/assets/icons/verified-icon.svg";
import { CheckoutAddressTracker } from "@/components/analytics/checkout-address-tracker";
import HomeIcon from "@/components/icons/home-icon";
import { DrawerLayout } from "@/components/shared/layouts/drawer-layout";
import { useCheckoutContext } from "@/contexts/checkout-context";

import type { CheckoutAddress } from "./checkout-page";

type ActionButton = {
  icon: string;
  key: string;
  label: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
};

interface CheckoutAddressDrawerProps {
  addresses: CheckoutAddress[];
  initialTab?: "gifting" | "home";
  onAddNew: () => void;
  onClose: () => void;
  onDelete?: (address: CheckoutAddress) => void;
  onEdit: (address: CheckoutAddress) => void;
  onSelect: (addressId: string) => void;
  selectedAddressId: null | string;
}

type TabKey = "gifting" | "home";

export function CheckoutAddressDrawer({
  addresses,
  initialTab,
  onAddNew,
  onClose,
  onDelete,
  onEdit,
  onSelect,
  selectedAddressId,
}: CheckoutAddressDrawerProps) {
  const locale = useLocale();
  const isArabic = locale?.toLowerCase().startsWith("ar");
  const t = useTranslations("CheckoutPage.addressDrawer");
  const { selectedLockerAddressType } = useCheckoutContext();

  const tabs = useMemo(() => {
    return [
      { key: "home" as TabKey, label: t("tabs.home") },
      { key: "gifting" as TabKey, label: t("tabs.gifting") },
    ];
  }, [t]);
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab ?? "home");

  // Update active tab when initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const filteredAddresses = useMemo(() => {
    return addresses.filter((address) => {
      const addressLabel =
        (address.customerAddress as any)?.address_label ||
        (address.customerAddress as any)?.raw?.address_label ||
        (address as any)?.address_label ||
        "";
      const normalizedLabel = addressLabel?.toLowerCase() || "";

      if (activeTab === "home") {
        return normalizedLabel === "home" || normalizedLabel === "";
      }
      if (activeTab === "gifting") {
        return normalizedLabel === "gift";
      }
      return true;
    });
  }, [addresses, activeTab]);

  const sortedAddresses = useMemo(() => {
    return [...filteredAddresses].sort((a, b) => {
      if (a.id === selectedAddressId) return -1;
      if (b.id === selectedAddressId) return 1;
      if (a.isDefault === b.isDefault) return 0;
      return a.isDefault ? -1 : 1;
    });
  }, [filteredAddresses, selectedAddressId]);

  useEffect(() => {
    console.info("[CheckoutAddressDrawer] sortedAddresses:", sortedAddresses);
  }, [sortedAddresses]);

  const createActionButtons = (address: CheckoutAddress): ActionButton[] => {
    const actions: ActionButton[] = [
      {
        icon: EditIcon,
        key: "edit",
        label: t("edit"),
        onClick: (event) => {
          event.stopPropagation();
          onEdit(address);
        },
      },
    ];

    if (!address.isDefault && onDelete) {
      actions.push({
        icon: TrashIcon,
        key: "delete",
        label: t("delete"),
        onClick: (event) => {
          event.stopPropagation();
          onDelete(address);
        },
      });
    }

    return isArabic ? actions.reverse() : actions;
  };

  return (
    <DrawerLayout
      onBack={onClose}
      onClose={onClose}
      showBackButton={true}
      title={t("title")}
      widthClassName="!w-[420px]"
    >
      <CheckoutAddressTracker />
      <div
        className="flex h-full flex-col bg-[#F7F8FA]"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="space-y-5 px-5 pb-5 pt-2.5">
          <button
            className="text-text-primary hover:bg-primary/5 shadow-xs h-[50px] w-full rounded-[10px] bg-white font-[Gilroy] text-[20px] font-medium transition"
            onClick={onAddNew}
            type="button"
          >
            {t("addNew")}
          </button>

          <div className="flex items-center justify-between border-[#DADDE4]">
            {tabs.map((tab) => (
              <button
                className={`border-b-2 text-sm font-semibold transition ${
                  tab.key === activeTab
                    ? "border-text-primary text-text-primary"
                    : "border-transparent text-[#85878A]"
                }`}
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-20">
          <div className="flex flex-col gap-4">
            {sortedAddresses.length === 0 ? (
              <div className="text-text-tertiary text-center text-sm">
                {t("empty")}
              </div>
            ) : (
              sortedAddresses.map((address) => {
                // If a locker address is selected, no regular address should be marked as selected
                const isSelected =
                  !selectedLockerAddressType &&
                  address.id === selectedAddressId;
                const addressLabel =
                  (address.customerAddress as any)?.address_label ||
                  (address.customerAddress as any)?.raw?.address_label ||
                  (address as any)?.address_label ||
                  "";
                const normalizedLabel = addressLabel?.toLowerCase() || "";
                const isGiftAddress = normalizedLabel === "gift";
                const iconColor = address.isDefault ? "#374957" : "#BDC2C5";
                const verificationValue =
                  (address.customerAddress as any)?.is_ksa_verified ??
                  (address.customerAddress as any)?.raw?.is_ksa_verified;
                const hasVerificationStatus =
                  typeof verificationValue === "boolean";
                const isKsaVerified = verificationValue === true;

                return (
                  <div
                    className={`hover:border-primary/60 rounded-[10px] border bg-white transition ${
                      isSelected
                        ? "border-primary shadow-sm"
                        : "border-[#F3F3F3]"
                    }`}
                    key={address.id}
                    onClick={() => onSelect(address.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div
                      className={`text-text-primary grid gap-y-2 p-5 text-xs ${
                        isArabic ? "text-right" : ""
                      }`}
                      style={{ gridTemplateColumns: "minmax(80px,auto) 1fr" }}
                    >
                      <span className="font-medium">{t("name")}</span>
                      <span className="min-w-0 truncate">{address.name}</span>

                      <span className="font-medium">{t("address")}</span>
                      <span className="min-w-0 break-all">
                        {(() => {
                          const countryName =
                            address.customerAddress?.countryLabel ??
                            address.customerAddress?.countryCode ??
                            "";
                          return countryName
                            ? `${countryName}, ${address.formattedAddress}`
                            : address.formattedAddress;
                        })()}
                      </span>

                      <span className="font-medium">{t("mobile")}</span>
                      <span
                        className={`flex items-center justify-between gap-3 ${
                          isArabic ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span className="inline-block" dir="ltr">
                          +{address.phoneNumber}
                        </span>
                        {hasVerificationStatus &&
                          (isKsaVerified ? (
                            <span className="inline-flex items-center gap-1 text-[8px] font-medium text-[#2563EB]">
                              <Image
                                alt={t("verified")}
                                className="shrink-0"
                                height={14}
                                src={VerifiedIcon}
                                width={14}
                              />
                              {t("verified")}
                            </span>
                          ) : (
                            <span className="text-[8px] font-medium text-[#F59E0B]">
                              {t("notVerified")}
                            </span>
                          ))}
                      </span>
                    </div>

                    <div
                      className={`flex items-center justify-between border-t border-[#E4E7EC] px-5 py-2.5`}
                    >
                      <span
                        className={`flex items-center gap-5 ${
                          isArabic ? "flex-row-reverse" : ""
                        }`}
                      >
                        {isSelected ? (
                          <span className="inline-flex cursor-pointer items-center rounded-[10px] border border-[#374957] bg-[#374957] px-5 py-1 text-[11px] font-medium tracking-wide text-white">
                            {t("selected")}
                          </span>
                        ) : address.isDefault ? (
                          <span className="inline-flex h-[25px] w-[90px] items-center justify-center rounded-[10px] border border-[#374957] bg-white px-2.5 py-2 text-[11px] font-medium tracking-wide text-[#374957]">
                            {t("default")}
                          </span>
                        ) : (
                          <span className="inline-flex cursor-pointer items-center rounded-[10px] border border-[#BDC2C5] px-3 py-1 text-[11px] font-medium tracking-wide text-[#BDC2C5]">
                            {t("selectAddress")}
                          </span>
                        )}
                        {isGiftAddress ? (
                          <Image
                            alt="Gift"
                            className="shrink-0"
                            height={15}
                            src={GiftIcon}
                            style={{
                              opacity: iconColor === "#374957" ? 1 : 0.5,
                            }}
                            unoptimized
                            width={15}
                          />
                        ) : (
                          <HomeIcon color={iconColor} height="15" width="15" />
                        )}
                      </span>

                      <div
                        className={`flex items-center gap-4 ${
                          isArabic ? "flex-row-reverse" : ""
                        }`}
                      >
                        {createActionButtons(address).map((action) => (
                          <button
                            className="text-text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-xs font-medium"
                            key={action.key}
                            onClick={action.onClick}
                            type="button"
                          >
                            <Image
                              alt={action.label}
                              height={15}
                              priority
                              src={action.icon}
                              unoptimized
                              width={15}
                            />
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DrawerLayout>
  );
}
