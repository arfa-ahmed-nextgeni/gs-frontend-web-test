"use client";

import { ReactNode, useEffect, useState } from "react";

import { useSelectedLayoutSegment } from "next/navigation";
import Script from "next/script";

import { ApplePayProvider } from "@/contexts/apple-pay-context";
import { CheckoutProvider } from "@/contexts/checkout-context";
import { useIsMobile } from "@/hooks/use-is-mobile";

export default function CheckoutLayout({
  children,
  drawer,
}: {
  children: ReactNode;
  drawer: ReactNode;
}) {
  const drawerSegment = useSelectedLayoutSegment("drawer");

  const isMobile = useIsMobile();

  const hasActiveDrawer = !!drawerSegment;

  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    if (isScriptLoaded) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsScriptLoaded(true);
    }, 8000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isScriptLoaded]);

  return (
    <>
      <Script
        crossOrigin="anonymous"
        onLoad={() => {
          setIsScriptLoaded(true);
        }}
        onReady={() => {
          setIsScriptLoaded(true);
        }}
        src="https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js"
        strategy="afterInteractive"
      />
      <CheckoutProvider>
        <ApplePayProvider isScriptLoaded={isScriptLoaded}>
          {hasActiveDrawer && isMobile ? null : children}
          {drawer}
        </ApplePayProvider>
      </CheckoutProvider>
    </>
  );
}
