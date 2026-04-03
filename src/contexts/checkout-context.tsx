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

export type CheckoutContextType = {
  cameFromShippingOptionDrawer: boolean;
  isShippingOptionDrawerOpen: boolean;
  selectedLockerAddressType: LockerType | null;
  selectedPayment: string;
  setCameFromShippingOptionDrawer: (value: boolean) => void;
  setIsShippingOptionDrawerOpen: (value: boolean) => void;
  setSelectedLockerAddressType: (type: LockerType | null) => void;
  setSelectedPayment: Dispatch<SetStateAction<string>>;
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
        isShippingOptionDrawerOpen,
        selectedLockerAddressType,
        selectedPayment,
        setCameFromShippingOptionDrawer,
        setIsShippingOptionDrawerOpen,
        setSelectedLockerAddressType,
        setSelectedPayment,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};
