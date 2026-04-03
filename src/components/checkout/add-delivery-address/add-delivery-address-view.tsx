"use client";

import { useEffect, useRef, useState } from "react";

import { AddDeliveryAddressMap } from "@/components/checkout/add-delivery-address/add-delivery-address-map";
import { AddDeliveryAddressSteps } from "@/components/checkout/add-delivery-address/add-delivery-address-steps";
import { AddressForm } from "@/components/customer/addresses/manage-address/address-form";
import { useAddDeliveryAddressContext } from "@/contexts/add-delivery-address-context";
import { AddressFormContextProvider } from "@/contexts/address-form-context";
import { useStoreConfig } from "@/contexts/store-config-context";

export const AddDeliveryAddressView = () => {
  const stepsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { storeConfig } = useStoreConfig();
  const code = storeConfig?.code;

  // Feature flag: Set to true to enable map-based flow, false for traditional form
  const [enableMapFlow] = useState(code?.endsWith("sa"));

  // Get customer data and showSaveForm from context
  const {
    customerData,
    deliveryType,
    isManualEntryMode,
    setShowSaveForm,
    showSaveForm,
  } = useAddDeliveryAddressContext();

  useEffect(() => {
    const updateStepsHeight = () => {
      if (stepsRef.current && containerRef.current) {
        const stepsHeight = stepsRef.current.offsetHeight;
        containerRef.current.style.setProperty(
          "--steps-height",
          `${stepsHeight}px`
        );
      }
    };

    // Initial measurement
    updateStepsHeight();

    // Update on resize
    const resizeObserver = new ResizeObserver(updateStepsHeight);
    if (stepsRef.current) {
      resizeObserver.observe(stepsRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Map flow: show map + steps (for both home and gift delivery)
  if (enableMapFlow) {
    if (showSaveForm && isManualEntryMode) {
      return (
        <AddressFormContextProvider
          customerData={customerData}
          initialAddressLabel={
            deliveryType === "gift_delivery" ? "gift" : "home"
          }
          isFirstAddressInCheckout
          onClose={() => {
            window.history.back();
          }}
          onRootBack={() => {
            setShowSaveForm(false);
          }}
          onSuccess={() => {
            // Address form submission handled by the form itself
          }}
        >
          <div
            className="flex flex-1 flex-col overflow-hidden"
            ref={containerRef}
          >
            <AddressForm />
          </div>
        </AddressFormContextProvider>
      );
    }

    return (
      <div className="flex flex-1 flex-col overflow-hidden" ref={containerRef}>
        {!showSaveForm && <AddDeliveryAddressMap />}
        <div ref={stepsRef}>
          <AddDeliveryAddressSteps
            setShowSaveForm={setShowSaveForm}
            showSaveForm={showSaveForm}
          />
        </div>
      </div>
    );
  }

  // Default flow: show traditional address form
  return (
    <AddressFormContextProvider
      customerData={customerData}
      initialAddressLabel={deliveryType === "gift_delivery" ? "gift" : "home"}
      isFirstAddressInCheckout
      onSuccess={() => {
        // Address form submission handled by the form itself
      }}
    >
      <div className="flex flex-1 flex-col overflow-hidden" ref={containerRef}>
        <AddressForm />
      </div>
    </AddressFormContextProvider>
  );
};
