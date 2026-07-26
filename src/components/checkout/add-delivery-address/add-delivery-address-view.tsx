"use client";

import { useEffect, useRef, useState } from "react";

import { AddDeliveryAddressMap } from "@/components/checkout/add-delivery-address/add-delivery-address-map";
import { AddDeliveryAddressSteps } from "@/components/checkout/add-delivery-address/add-delivery-address-steps";
import { AddressForm } from "@/components/customer/addresses/manage-address/address-form";
import { useAddDeliveryAddressContext } from "@/contexts/add-delivery-address-context";
import { AddressFormContextProvider } from "@/contexts/address-form-context";
import { useOptionalCheckoutContext } from "@/contexts/checkout-context";
import { useStoreConfig } from "@/contexts/store-config-context";
import {
  CHECKOUT_ADDRESS_SAVED_EVENT,
  CHECKOUT_ADDRESS_SAVED_FLAG,
} from "@/lib/constants/checkout/events";

import type { CustomerAddress } from "@/lib/models/customer-addresses";

export const AddDeliveryAddressView = () => {
  const stepsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const checkoutContext = useOptionalCheckoutContext();

  const { storeConfig } = useStoreConfig();
  const code = storeConfig?.code;

  // Feature flag: Set to true to enable map-based flow, false for traditional form
  const [enableMapFlow] = useState(code?.endsWith("sa"));

  // Get customer data and showSaveForm from context
  const {
    customerData,
    deliveryType,
    editingAddressId,
    initialAddressSnapshot,
    initialContactData,
    isFirstAddressInCheckout,
    isManualEntryMode,
    resetFlowState,
    setShowSaveForm,
    showSaveForm,
  } = useAddDeliveryAddressContext();
  const isEditing = Boolean(editingAddressId);

  // Build a CustomerAddress-compatible object from the snapshot so the manual
  // entry form is pre-populated when editing an existing address.
  const editingCustomerAddress:
    | ({ countryLabel?: string; stateLabel?: string } & CustomerAddress)
    | undefined =
    isEditing && editingAddressId && initialAddressSnapshot
      ? {
          city: initialAddressSnapshot.city ?? "",
          cityCode: initialAddressSnapshot.city ?? "",
          countryCode: initialAddressSnapshot.countryCode ?? "",
          countryLabel: initialAddressSnapshot.countryLabel,
          firstName: initialContactData?.firstName || "",
          formattedAddress: initialAddressSnapshot.formattedAddress ?? "",
          id: editingAddressId,
          isDefault: initialAddressSnapshot.isDefault,
          ksaShortAddress: initialAddressSnapshot.shortCode ?? "",
          lastName: initialContactData?.lastName || "",
          middleName: initialAddressSnapshot.middleName,
          mobileNumber: initialContactData?.phoneNumber || "",
          name: [initialContactData?.firstName, initialContactData?.lastName]
            .filter(Boolean)
            .join(" "),
          postcode: initialAddressSnapshot.postalCode ?? "",
          raw: {
            ksa_short_address: initialAddressSnapshot.shortCode ?? "",
            telephone: initialContactData?.phoneNumber || "",
          },
          regionId: initialAddressSnapshot.regionId,
          regionName: initialAddressSnapshot.district ?? "",
          stateLabel: initialAddressSnapshot.stateLabel,
          street: [
            initialAddressSnapshot.street ?? null,
            initialAddressSnapshot.streetLine2 ?? null,
          ],
        }
      : undefined;

  const notifyCheckoutAddressSaved = (addressId?: string) => {
    if (!addressId) {
      return;
    }

    const savedAddressPayload = JSON.stringify({
      addressId,
      mode: "create",
      type: deliveryType,
    });

    window.sessionStorage.setItem(
      CHECKOUT_ADDRESS_SAVED_FLAG,
      savedAddressPayload
    );
    window.dispatchEvent(
      new CustomEvent(CHECKOUT_ADDRESS_SAVED_EVENT, {
        detail: {
          addressId,
          mode: "create",
          type: deliveryType,
        },
      })
    );
  };

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
          customerAddress={editingCustomerAddress}
          customerData={customerData}
          initialAddressLabel={
            deliveryType === "gift_delivery" ? "gift" : "home"
          }
          isEditing={isEditing}
          isFirstAddressInCheckout={isFirstAddressInCheckout}
          onClose={() => {
            // Reset manual/map flow state so the next SA open starts from the map.
            resetFlowState();
            checkoutContext?.setDeliveryAddressFlowState(null);
            checkoutContext?.setIsShippingOptionDrawerOpen(false);
            window.history.back();
          }}
          onRootBack={() => {
            setShowSaveForm(false);
          }}
          onSuccess={(addressId) => {
            notifyCheckoutAddressSaved(addressId);
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
      customerAddress={editingCustomerAddress}
      customerData={customerData}
      initialAddressLabel={deliveryType === "gift_delivery" ? "gift" : "home"}
      initialSkipState={!editingCustomerAddress?.stateLabel}
      isEditing={isEditing}
      isFirstAddressInCheckout={isFirstAddressInCheckout}
      onClose={() => {
        resetFlowState();
        checkoutContext?.setDeliveryAddressFlowState(null);
        checkoutContext?.setIsShippingOptionDrawerOpen(false);
        window.history.back();
      }}
      onSuccess={(addressId) => {
        notifyCheckoutAddressSaved(addressId);
      }}
    >
      <div className="flex flex-1 flex-col overflow-hidden" ref={containerRef}>
        <AddressForm />
      </div>
    </AddressFormContextProvider>
  );
};
