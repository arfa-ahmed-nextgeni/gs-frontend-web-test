"use client";

import { useState } from "react";

import { ManualGeolocationInput } from "@/components/checkout/add-pickup-point/manual-geolocation-input";
import { Button } from "@/components/ui/button";
import { useAddPickupPointContext } from "@/contexts/add-pickup-point-context";
import { ADD_PICKUP_POINT_STEPS } from "@/lib/constants/checkout/add-pickup-point-steps";
import { ENABLE_MANUAL_GEOLOCATION } from "@/lib/constants/checkout/manual-geolocation";

export const ManualGeolocationTrigger = () => {
  const [open, setOpen] = useState(false);
  const { currentStep } = useAddPickupPointContext();

  // Only render if feature flag is enabled
  if (!ENABLE_MANUAL_GEOLOCATION) {
    return null;
  }

  // Only render on location selection step
  if (currentStep !== ADD_PICKUP_POINT_STEPS.LOCATION_SELECTION) {
    return null;
  }

  return (
    <>
      <Button
        className="fixed bottom-4 end-4 z-50 bg-yellow-500 text-black hover:bg-yellow-600"
        onClick={() => setOpen(true)}
        size="sm"
        type="button"
      >
        QA: Set Location
      </Button>
      <ManualGeolocationInput onOpenChange={setOpen} open={open} />
    </>
  );
};
