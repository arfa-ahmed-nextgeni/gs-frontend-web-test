"use client";

import { PropsWithChildren } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import ShieldIcon from "@/assets/icons/Shield.svg";
import { DrawerLayout } from "@/components/shared/layouts/drawer-layout";
import { useAddPickupPointContext } from "@/contexts/add-pickup-point-context";
import { useCheckoutContext } from "@/contexts/checkout-context";
import {
  trackBackToFodel,
  trackBackToRedbox,
  trackBackToShippingType,
} from "@/lib/analytics/events";
import { LockerType } from "@/lib/constants/checkout/locker-locations";

export const AddPickupPointDrawerLayout = ({ children }: PropsWithChildren) => {
  const t = useTranslations("AddPickupPointPage");

  const { closeDrawer, currentStep, lockerType, prevStep } =
    useAddPickupPointContext();
  const { cameFromShippingOptionDrawer, setIsShippingOptionDrawerOpen } =
    useCheckoutContext();

  const handleBack = () => {
    if (currentStep > 0) {
      prevStep();
    } else if (cameFromShippingOptionDrawer) {
      // Track back_to_shipping_type when going back from Redbox or Fodel popup/page
      trackBackToShippingType();
      // only reopen shipping option drawer if we came from it
      setIsShippingOptionDrawerOpen(true);
      closeDrawer();
    } else {
      // Track back_to_redbox or back_to_fodel when going back from popup/page
      if (lockerType === LockerType.Fodel) {
        trackBackToFodel();
      } else if (lockerType === LockerType.Redbox) {
        trackBackToRedbox();
      }
      closeDrawer();
    }
  };

  const handleClose = () => {
    if (cameFromShippingOptionDrawer) {
      // only reopen shipping option drawer if we came from it
      setIsShippingOptionDrawerOpen(true);
    }
    closeDrawer();
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
      showDesktopBackButton={currentStep > 0 || cameFromShippingOptionDrawer}
      title={t("title")}
    >
      {children}
    </DrawerLayout>
  );
};
