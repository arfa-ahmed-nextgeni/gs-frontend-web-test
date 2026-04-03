"use client";

import { createContext, PropsWithChildren, useContext } from "react";

import { useStoreConfigQuery } from "@/hooks/queries/use-store-config";
import { Store } from "@/lib/models/stores";

export type StoreConfigContextType = {
  storeConfig: null | Store;
};

const StoreConfigContext = createContext<StoreConfigContextType | undefined>(
  undefined
);

export const StoreConfigProvider = ({ children }: PropsWithChildren) => {
  const { data } = useStoreConfigQuery();

  return (
    <StoreConfigContext.Provider
      value={{
        storeConfig: data?.store || null,
      }}
    >
      {children}
    </StoreConfigContext.Provider>
  );
};

export const useStoreConfig = () => {
  const context = useContext(StoreConfigContext);
  if (!context) {
    throw new Error("useStoreConfig must be used within a StoreConfigProvider");
  }
  return context;
};
