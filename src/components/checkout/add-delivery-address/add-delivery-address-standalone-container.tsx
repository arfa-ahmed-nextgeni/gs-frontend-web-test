"use client";

import Image from "next/image";

import { useTranslations } from "next-intl";

import ShieldIcon from "@/assets/icons/Shield.svg";
import { AddDeliveryAddressView } from "@/components/checkout/add-delivery-address/add-delivery-address-view";
import { DrawerLayout } from "@/components/shared/layouts/drawer-layout";
import { useAddDeliveryAddressContext } from "@/contexts/add-delivery-address-context";

export const AddDeliveryAddressStandaloneContainer = () => {
  const t = useTranslations("AddDeliveryAddressPage");
  const { deliveryType, resetFlowState, setShowSaveForm, showSaveForm } =
    useAddDeliveryAddressContext();

  const handleBack = () => {
    if (showSaveForm) {
      setShowSaveForm(false);
      return;
    }

    // Reset the flow before leaving so the next open does not reuse the last map state.
    resetFlowState();
    window.history.back();
  };

  const handleClose = () => {
    if (showSaveForm) {
      setShowSaveForm(false);
      return;
    }

    // Reset the flow before leaving so the next open does not reuse the last map state.
    resetFlowState();
    window.history.back();
  };

  return (
    <DrawerLayout
      contentContainerClassName="flex"
      mobileHeaderEndContent={
        <Image
          alt="shield"
          className="size-5"
          height={20}
          src={ShieldIcon}
          width={20}
        />
      }
      onBack={handleBack}
      onClose={handleClose}
      showBackButton
      showDesktopBackButton
      title={deliveryType === "gift_delivery" ? t("giftTitle") : t("title")}
    >
      <AddDeliveryAddressView />
    </DrawerLayout>
  );
};
