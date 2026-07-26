"use client";

import { createContext, useContext } from "react";

export type CheckoutFramesContextType = {
  isScriptLoaded: boolean;
  publicKey: string;
};

const CheckoutFramesContext = createContext<
  CheckoutFramesContextType | undefined
>(undefined);

export const useCheckoutFramesContext = () => {
  const context = useContext(CheckoutFramesContext);
  if (context === undefined) {
    throw new Error(
      "useCheckoutFramesContext must be used within CheckoutFramesProvider"
    );
  }
  return context;
};

export const CheckoutFramesProvider = ({
  children,
  isScriptLoaded,
  publicKey,
}: {
  children: React.ReactNode;
  isScriptLoaded: boolean;
  publicKey: string;
}) => {
  return (
    <CheckoutFramesContext.Provider value={{ isScriptLoaded, publicKey }}>
      {children}
    </CheckoutFramesContext.Provider>
  );
};
