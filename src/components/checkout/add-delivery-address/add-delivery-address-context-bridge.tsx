"use client";

import { useEffect } from "react";

import { AddDeliveryAddressContainer } from "@/components/checkout/add-delivery-address/add-delivery-address-container";
import { AddDeliveryAddressContextProvider } from "@/contexts/add-delivery-address-context";
import { useCheckoutContext } from "@/contexts/checkout-context";

type AddDeliveryAddressContextBridgeProps = {
  customerData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
  deliveryType: string;
  isFirstAddressInCheckout: boolean;
};

export const AddDeliveryAddressContextBridge = ({
  customerData,
  deliveryType,
  isFirstAddressInCheckout,
}: AddDeliveryAddressContextBridgeProps) => {
  const { deliveryAddressFlowState, setIsShippingOptionDrawerOpen } =
    useCheckoutContext();

  // Close drawer, so it doesn't reappear on mobile view when navigating back after saving an address.
  useEffect(() => {
    setIsShippingOptionDrawerOpen(false);
  }, [setIsShippingOptionDrawerOpen]);

  return (
    <AddDeliveryAddressContextProvider
      customerData={customerData}
      deliveryType={deliveryType}
      editingAddressId={deliveryAddressFlowState?.editingAddressId}
      initialAddressSnapshot={deliveryAddressFlowState?.initialAddressSnapshot}
      initialContactData={deliveryAddressFlowState?.initialContactData}
      initialSelectedLocation={
        deliveryAddressFlowState?.initialSelectedLocation
      }
      isFirstAddressInCheckout={isFirstAddressInCheckout}
    >
      <AddDeliveryAddressContainer />
    </AddDeliveryAddressContextProvider>
  );
};
