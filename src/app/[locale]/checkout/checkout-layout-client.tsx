"use client";

import { ReactNode } from "react";

import { useSelectedLayoutSegment } from "next/navigation";
import Script from "next/script";

import { ApplePayProvider } from "@/contexts/apple-pay-context";
import { CheckoutProvider } from "@/contexts/checkout-context";
import { CheckoutFramesProvider } from "@/contexts/checkout-frames-context";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useScriptLoadWithTimeout } from "@/hooks/use-script-load-with-timeout";

export default function CheckoutLayoutClient({
  checkoutComPublicKey,
  children,
  drawer,
}: {
  checkoutComPublicKey: string;
  children: ReactNode;
  drawer: ReactNode;
}) {
  const drawerSegment = useSelectedLayoutSegment("drawer");

  const isMobile = useIsMobile();

  const hasActiveDrawer = !!drawerSegment;

  const [isApplePayScriptLoaded, markApplePayScriptLoaded] =
    useScriptLoadWithTimeout();
  const [isFramesScriptLoaded, markFramesScriptLoaded] =
    useScriptLoadWithTimeout();

  return (
    <>
      <Script
        crossOrigin="anonymous"
        onLoad={markApplePayScriptLoaded}
        onReady={markApplePayScriptLoaded}
        src="https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js"
        strategy="afterInteractive"
      />
      <Script
        onLoad={markFramesScriptLoaded}
        onReady={markFramesScriptLoaded}
        src="https://cdn.checkout.com/js/framesv2.min.js"
        strategy="afterInteractive"
      />
      <CheckoutProvider>
        <CheckoutFramesProvider
          isScriptLoaded={isFramesScriptLoaded}
          publicKey={checkoutComPublicKey}
        >
          <ApplePayProvider isScriptLoaded={isApplePayScriptLoaded}>
            {hasActiveDrawer && isMobile ? null : children}
            {drawer}
          </ApplePayProvider>
        </CheckoutFramesProvider>
      </CheckoutProvider>
    </>
  );
}
