"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

import { usePathname } from "@/i18n/navigation";
import { getRouteKey } from "@/lib/utils/routes";

type NavigationContextType = {
  currentPathname: string;
  previousPathname: string;
  prevRouteKey: null | string;
};

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export const NavigationProvider = ({ children }: React.PropsWithChildren) => {
  const pathname = usePathname();
  const prevPathnameRef = useRef<null | string>(null);

  const [previousPathname, setPreviousPathname] = useState("");

  useEffect(() => {
    setPreviousPathname(prevPathnameRef.current || "");
    prevPathnameRef.current = pathname;
  }, [pathname]);

  const value: NavigationContextType = {
    currentPathname: pathname,
    previousPathname,
    prevRouteKey: previousPathname ? getRouteKey(previousPathname) : null,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigationContext = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error(
      "useNavigationContext must be used within NavigationProvider"
    );
  }
  return context;
};
