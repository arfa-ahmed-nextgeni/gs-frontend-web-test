"use client";

import { PropsWithChildren } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import ShieldIcon from "@/assets/icons/Shield.svg";
import { DrawerLayout } from "@/components/shared/layouts/drawer-layout";
import { useAddDeliveryAddressContext } from "@/contexts/add-delivery-address-context";
import { useCheckoutContext } from "@/contexts/checkout-context";
import { trackBackToShippingType } from "@/lib/analytics/events";

export const AddDeliveryAddressDrawerLayout = ({
  children,
}: PropsWithChildren) => {
  const t = useTranslations("AddDeliveryAddressPage");

  const {
    deliveryType,
    editingAddressId,
    resetFlowState,
    setShowSaveForm,
    showSaveForm,
  } = useAddDeliveryAddressContext();
  const {
    cameFromAddressDrawer,
    cameFromShippingOptionDrawer,
    setDeliveryAddressFlowState,
    setIsAddressDrawerOpen,
    setIsShippingOptionDrawerOpen,
  } = useCheckoutContext();

  const handleBack = () => {
    // If save form is showing in map flow, go back to map instead of closing drawer
    if (showSaveForm) {
      setShowSaveForm(false);
      return;
    }

    if (cameFromShippingOptionDrawer) {
      // Track back_to_shipping_type when going back from delivery address page
      trackBackToShippingType();
      // only reopen shipping option drawer if we came from it
      setIsShippingOptionDrawerOpen(true);
      closeDrawer();
    } else if (cameFromAddressDrawer) {
      // Reopen address drawer when navigating back from an edit started there
      setIsAddressDrawerOpen(true);
      closeDrawer();
    } else {
      closeDrawer();
    }
  };

  const handleClose = () => {
    // If save form is showing in map flow, go back to map instead of closing drawer
    if (showSaveForm) {
      setShowSaveForm(false);
      return;
    }

    if (cameFromShippingOptionDrawer) {
      // only reopen shipping option drawer if we came from it
      setIsShippingOptionDrawerOpen(true);
    } else if (cameFromAddressDrawer) {
      // Reopen address drawer when closing from an edit started there
      setIsAddressDrawerOpen(true);
    }
    closeDrawer();
  };

  const closeDrawer = () => {
    // Reset the add-address flow so reopening the drawer starts fresh.
    setDeliveryAddressFlowState(null);
    resetFlowState();
    // Navigate back to checkout
    window.history.back();
  };

  const getTitle = () => {
    const isEditing = Boolean(editingAddressId);
    if (deliveryType === "gift_delivery") {
      return isEditing ? t("editGiftTitle") : t("giftTitle");
    }
    return isEditing ? t("editTitle") : t("title");
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
      showDesktopBackButton={cameFromShippingOptionDrawer}
      title={getTitle()}
      widthClassName="!w-[420px]"
    >
      {children}
    </DrawerLayout>
  );
};
