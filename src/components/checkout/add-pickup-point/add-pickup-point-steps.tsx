"use client";

import { useMemo } from "react";

import { AddPickupPointAddressForm } from "@/components/checkout/add-pickup-point/add-pickup-point-address-form";
import { AddPickupPointLocationSelection } from "@/components/checkout/add-pickup-point/add-pickup-point-location-selection";
import { useAddPickupPointContext } from "@/contexts/add-pickup-point-context";
import {
  ADD_PICKUP_POINT_STEPS,
  AddPickupPointStep,
} from "@/lib/constants/checkout/add-pickup-point-steps";
import { cn } from "@/lib/utils";

export const AddPickupPointSteps = () => {
  const { currentStep, customerData } = useAddPickupPointContext();

  const isEmailFieldVisible = useMemo(() => {
    return (
      currentStep === ADD_PICKUP_POINT_STEPS.ADDRESS_FORM &&
      !customerData?.email
    );
  }, [currentStep, customerData?.email]);

  const renderStepContent = (currentStep: AddPickupPointStep) => {
    switch (currentStep) {
      case ADD_PICKUP_POINT_STEPS.ADDRESS_FORM:
        return <AddPickupPointAddressForm />;
      case ADD_PICKUP_POINT_STEPS.LOCATION_SELECTION:
      default:
        return <AddPickupPointLocationSelection />;
    }
  };

  return (
    <div
      className={cn(
        "bg-bg-body flex flex-1 flex-col",
        isEmailFieldVisible ? "md:min-h-1/2 min-h-[50vh]" : "min-h-1/2"
      )}
    >
      {renderStepContent(currentStep)}
    </div>
  );
};
