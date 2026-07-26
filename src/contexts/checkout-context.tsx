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
  cameFromAddressDrawer: boolean;
  cameFromShippingOptionDrawer: boolean;
  deliveryAddressEntryKey: number;
  deliveryAddressFlowState: DeliveryAddressFlowState | null;
  isAddressDrawerOpen: boolean;
  isShippingOptionDrawerOpen: boolean;
  selectedLockerAddressType: LockerType | null;
  selectedPayment: string;
  setCameFromAddressDrawer: (value: boolean) => void;
  setCameFromShippingOptionDrawer: (value: boolean) => void;
  setDeliveryAddressFlowState: (value: DeliveryAddressFlowState | null) => void;
  setIsAddressDrawerOpen: (value: boolean) => void;
  setIsShippingOptionDrawerOpen: (value: boolean) => void;
  setSelectedLockerAddressType: (type: LockerType | null) => void;
  setSelectedPayment: Dispatch<SetStateAction<string>>;
  updateDeliveryAddressEntryKey: () => void;
};

type DeliveryAddressFlowContactData = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

type DeliveryAddressFlowSnapshot = {
  city: string;
  countryCode?: string;
  countryLabel?: string;
  district: string;
  formattedAddress: string;
  isDefault: boolean;
  middleName?: string;
  postalCode: string;
  regionId?: null | number;
  shortCode: string;
  stateLabel?: string;
  street: string;
  streetLine2?: string;
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
  const [cameFromAddressDrawer, setCameFromAddressDrawer] = useState(false);
  const [cameFromShippingOptionDrawer, setCameFromShippingOptionDrawer] =
    useState(false);
  const [deliveryAddressEntryKey, setDeliveryAddressEntryKey] = useState(0);
  const [deliveryAddressFlowState, setDeliveryAddressFlowState] =
    useState<DeliveryAddressFlowState | null>(null);
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
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
        cameFromAddressDrawer,
        cameFromShippingOptionDrawer,
        deliveryAddressEntryKey,
        deliveryAddressFlowState,
        isAddressDrawerOpen,
        isShippingOptionDrawerOpen,
        selectedLockerAddressType,
        selectedPayment,
        setCameFromAddressDrawer,
        setCameFromShippingOptionDrawer,
        setDeliveryAddressFlowState,
        setIsAddressDrawerOpen,
        setIsShippingOptionDrawerOpen,
        setSelectedLockerAddressType,
        setSelectedPayment,
        updateDeliveryAddressEntryKey: () =>
          setDeliveryAddressEntryKey((prev) => prev + 1),
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};
