"use client";

import { createContext, useContext } from "react";

import { useCheckoutContext } from "@/contexts/checkout-context";
import { useApplePayAvailability } from "@/hooks/checkout/use-apple-pay-availability";

export type ApplePayContextType = {
  isScriptLoaded: boolean;
} & ReturnType<typeof useApplePayAvailability>;

const ApplePayContext = createContext<ApplePayContextType | undefined>(
  undefined
);

export const useApplePayContext = () => {
  const context = useContext(ApplePayContext);
  if (context === undefined) {
    throw new Error("useApplePayContext must be used within ApplePayProvider");
  }
  return context;
};

export const ApplePayProvider = ({
  children,
  isScriptLoaded,
}: {
  children: React.ReactNode;
  isScriptLoaded: boolean;
}) => {
  const { selectedPayment } = useCheckoutContext();

  // Only check availability if an Apple Pay payment method is selected
  const applePayAvailability = useApplePayAvailability(
    isScriptLoaded,
    selectedPayment
  );

  return (
    <ApplePayContext.Provider
      value={{ ...applePayAvailability, isScriptLoaded }}
    >
      {children}
    </ApplePayContext.Provider>
  );
};
