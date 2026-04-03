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

  const { deliveryType, setShowSaveForm, showSaveForm } =
    useAddDeliveryAddressContext();
  const { cameFromShippingOptionDrawer, setIsShippingOptionDrawerOpen } =
    useCheckoutContext();

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
    }
    closeDrawer();
  };

  const closeDrawer = () => {
    // Navigate back to checkout
    window.history.back();
  };

  const getTitle = () => {
    if (deliveryType === "gift_delivery") {
      return t("giftTitle");
    }
    return t("title");
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
    >
      {children}
    </DrawerLayout>
  );
};
