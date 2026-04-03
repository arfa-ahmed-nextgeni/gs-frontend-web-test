"use client";

import { PropsWithChildren } from "react";

import { useTranslations } from "next-intl";

import { DrawerLayout } from "@/components/shared/layouts/drawer-layout";
import { useAddressFormContext } from "@/contexts/address-form-context";

export const ManageAddressDrawerLayout = ({ children }: PropsWithChildren) => {
  const t = useTranslations("CustomerAddAddressPage");

  const {
    closeDrawer,
    currentStep,
    hasNavigatedSteps,
    isEditMode,
    prevStep,
    rootBackAction,
  } = useAddressFormContext();

  const handleBack = isEditMode
    ? rootBackAction
    : currentStep === 0
      ? rootBackAction
      : currentStep > 0 && hasNavigatedSteps
        ? prevStep
        : rootBackAction;

  return (
    <DrawerLayout
      onBack={handleBack}
      onClose={closeDrawer}
      showBackButton={true}
      showDesktopBackButton={true}
      title={t(isEditMode ? "editTitle" : "title")}
    >
      {children}
    </DrawerLayout>
  );
};
