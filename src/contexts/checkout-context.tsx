"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

import { useSessionStorage } from "@/hooks/use-session-storage";
import { LockerType } from "@/lib/constants/checkout/locker-locations";
import { CHECKOUT_STORAGE_KEYS } from "@/lib/constants/checkout/storage-keys";

type CheckoutContextType = {
  cameFromShippingOptionDrawer: boolean;
  deliveryAddressFlowState: DeliveryAddressFlowState | null;
  isShippingOptionDrawerOpen: boolean;
  selectedLockerAddressType: LockerType | null;
  selectedPayment: string;
  setCameFromShippingOptionDrawer: (value: boolean) => void;
  setDeliveryAddressFlowState: (value: DeliveryAddressFlowState | null) => void;
  setIsShippingOptionDrawerOpen: (value: boolean) => void;
  setSelectedLockerAddressType: (type: LockerType | null) => void;
  setSelectedPayment: Dispatch<SetStateAction<string>>;
};

type DeliveryAddressFlowContactData = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

type DeliveryAddressFlowSnapshot = {
  city: string;
  district: string;
  formattedAddress: string;
  isDefault: boolean;
  postalCode: string;
  shortCode: string;
  street: string;
};

type DeliveryAddressFlowState = {
  editingAddressId: null | string;
  initialAddressSnapshot: DeliveryAddressFlowSnapshot | null;
  initialContactData: DeliveryAddressFlowContactData | null;
  initialSelectedLocation: google.maps.LatLngLiteral | null;
};

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined
);

export const useCheckoutContext = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error("useCheckoutContext must be used within CheckoutProvider");
  }
  return context;
};

export const useOptionalCheckoutContext = () => {
  const context = useContext(CheckoutContext);
  return context;
};

export const CheckoutProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [cameFromShippingOptionDrawer, setCameFromShippingOptionDrawer] =
    useState(false);
  const [deliveryAddressFlowState, setDeliveryAddressFlowState] =
    useState<DeliveryAddressFlowState | null>(null);
  const [isShippingOptionDrawerOpen, setIsShippingOptionDrawerOpen] =
    useState(false);
  const [selectedLockerAddressType, setSelectedLockerAddressType] =
    useSessionStorage<LockerType | null>(
      CHECKOUT_STORAGE_KEYS.SELECTED_LOCKER_TYPE,
      null
    );
  const [selectedPayment, setSelectedPayment] = useState<string>("");

  return (
    <CheckoutContext.Provider
      value={{
        cameFromShippingOptionDrawer,
        deliveryAddressFlowState,
        isShippingOptionDrawerOpen,
        selectedLockerAddressType,
        selectedPayment,
        setCameFromShippingOptionDrawer,
        setDeliveryAddressFlowState,
        setIsShippingOptionDrawerOpen,
        setSelectedLockerAddressType,
        setSelectedPayment,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};
