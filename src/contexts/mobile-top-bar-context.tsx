"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useRouteMatch } from "@/hooks/use-route-match";
import { isNotifyMePath } from "@/lib/utils/routes";

export type MobileTopBarType = {
  handleBack: (() => void) | null;
  mobileTopBarTitle: null | string;
  productInfo: {
    brand: string;
    externalId?: string;
    id?: number;
    name: string;
    priceValue?: number;
    sku?: string;
    type?: string;
  } | null;
  resetProductInfo: () => void;
  setHandleBack: (fn: (() => void) | null) => void;
  setMobileTopBarTitle: Dispatch<SetStateAction<null | string>>;
  setProductInfo: Dispatch<
    SetStateAction<{
      brand: string;
      externalId?: string;
      id?: number;
      name: string;
      priceValue?: number;
      sku?: string;
      type?: string;
    } | null>
  >;
};

const MobileTopBar = createContext<MobileTopBarType | undefined>(undefined);

export const MobileTopBarContextProvider = ({
  children,
}: React.PropsWithChildren) => {
  const [handleBack, setHandleBackState] = useState<(() => void) | null>(null);
  const [mobileTopBarTitle, setMobileTopBarTitle] = useState<null | string>(
    null
  );
  const [productInfo, setProductInfo] = useState<{
    brand: string;
    externalId?: string;
    id?: number;
    name: string;
    priceValue?: number;
    sku?: string;
    type?: string;
  } | null>(null);

  const { isProduct, pathname } = useRouteMatch();
  const isNotifyMe = isNotifyMePath(pathname);

  const setHandleBack = useCallback((fn: (() => void) | null) => {
    setHandleBackState(() => fn);
  }, []);

  const resetProductInfo = useCallback(() => {
    setProductInfo(null);
  }, []);

  // Keep product info when effective route is product OR when notify-me overlay is open
  // (previousPathname can lag one render, so isProduct may be false when notify-me first opens)
  useEffect(() => {
    if (!isProduct && !isNotifyMe) {
      resetProductInfo();
    }
  }, [isProduct, isNotifyMe, resetProductInfo, productInfo]);

  return (
    <MobileTopBar.Provider
      value={{
        handleBack,
        mobileTopBarTitle,
        productInfo,
        resetProductInfo,
        setHandleBack,
        setMobileTopBarTitle,
        setProductInfo,
      }}
    >
      {children}
    </MobileTopBar.Provider>
  );
};

export const useMobileTopBarContext = () => {
  const context = useContext(MobileTopBar);
  if (!context) {
    throw new Error(
      "useMobileTopBarContext must be used within a MobileTopBarContextProvider"
    );
  }
  return context;
};
