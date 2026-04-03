"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  TransitionStartFunction,
  useContext,
  useState,
  useTransition,
} from "react";

export type AddressesContextType = {
  addressesLength: number;
  isUpdatingDefaultAddress: boolean;
  pendingAddressId: null | string;
  setPendingAddressId: Dispatch<SetStateAction<null | string>>;
  startUpdateDefaultAddress: TransitionStartFunction;
};

const AddressesContext = createContext<AddressesContextType | undefined>(
  undefined
);

export const AddressesContextProvider = ({
  addressesLength,
  children,
}: React.PropsWithChildren<{ addressesLength: number }>) => {
  const [isUpdatingDefaultAddress, startUpdateDefaultAddress] = useTransition();

  const [pendingAddressId, setPendingAddressId] = useState<null | string>(null);

  return (
    <AddressesContext.Provider
      value={{
        addressesLength,
        isUpdatingDefaultAddress,
        pendingAddressId,
        setPendingAddressId,
        startUpdateDefaultAddress,
      }}
    >
      {children}
    </AddressesContext.Provider>
  );
};

export const useAddressesContext = () => {
  const context = useContext(AddressesContext);
  if (!context) {
    throw new Error(
      "useAddressesContext must be used within a AddressesContextProvider"
    );
  }
  return context;
};
