"use client";

import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from "react";

import { ProductCardModel } from "@/lib/models/product-card-model";
import {
  ProductDetailsModel,
  ProductVariant,
} from "@/lib/models/product-details-model";

interface NotifyMeContextValue {
  product: null | ProductDetailsModel;
  productCard: null | ProductCardModel;
  selectedProduct: null | ProductVariant;
  setNotifyMeData: Dispatch<
    SetStateAction<{
      product: null | ProductDetailsModel;
      productCard: null | ProductCardModel;
      selectedProduct: null | ProductVariant;
    }>
  >;
}

export const NotifyMeContext = createContext<NotifyMeContextValue | undefined>(
  undefined
);

export function NotifyMeProvider({ children }: PropsWithChildren) {
  const [notifyMeData, setNotifyMeData] = useState<{
    product: null | ProductDetailsModel;
    productCard: null | ProductCardModel;
    selectedProduct: null | ProductVariant;
  }>({
    product: null,
    productCard: null,
    selectedProduct: null,
  });

  return (
    <NotifyMeContext.Provider
      value={{
        product: notifyMeData.product,
        productCard: notifyMeData.productCard,
        selectedProduct: notifyMeData.selectedProduct,
        setNotifyMeData,
      }}
    >
      {children}
    </NotifyMeContext.Provider>
  );
}

export function useNotifyMe() {
  const context = useContext(NotifyMeContext);
  if (!context) {
    throw new Error("useNotifyMe must be used within a NotifyMeProvider");
  }
  return context;
}
