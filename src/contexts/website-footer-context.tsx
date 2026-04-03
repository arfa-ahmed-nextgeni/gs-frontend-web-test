"use client";

import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

import type { WebsiteFooter } from "@/lib/models/website-footer";

type WebsiteFooterContextValue = {
  websiteFooter?: WebsiteFooter;
};

const WebsiteFooterContext = createContext<WebsiteFooterContextValue>({
  websiteFooter: undefined,
});

export function useWebsiteFooter() {
  return useContext(WebsiteFooterContext);
}

export function WebsiteFooterProvider({
  children,
  websiteFooter,
}: PropsWithChildren<WebsiteFooterContextValue>) {
  return (
    <WebsiteFooterContext.Provider value={{ websiteFooter }}>
      {children}
    </WebsiteFooterContext.Provider>
  );
}
