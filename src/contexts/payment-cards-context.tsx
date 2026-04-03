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

export type PaymentCardsContextType = {
  isUpdatingDefaultCard: boolean;
  paymentCardsLength: number;
  pendingCardId: null | string;
  setPendingCardId: Dispatch<SetStateAction<null | string>>;
  startUpdateDefaultCard: TransitionStartFunction;
};

const PaymentCardsContext = createContext<PaymentCardsContextType | undefined>(
  undefined
);

export const PaymentCardsContextProvider = ({
  children,
  paymentCardsLength,
}: React.PropsWithChildren<{ paymentCardsLength: number }>) => {
  const [isUpdatingDefaultCard, startUpdateDefaultCard] = useTransition();

  const [pendingCardId, setPendingCardId] = useState<null | string>(null);

  return (
    <PaymentCardsContext.Provider
      value={{
        isUpdatingDefaultCard,
        paymentCardsLength,
        pendingCardId,
        setPendingCardId,
        startUpdateDefaultCard,
      }}
    >
      {children}
    </PaymentCardsContext.Provider>
  );
};

export const usePaymentCardsContext = () => {
  const context = useContext(PaymentCardsContext);
  if (!context) {
    throw new Error(
      "usePaymentCardsContext must be used within a PaymentCardsContextProvider"
    );
  }
  return context;
};
