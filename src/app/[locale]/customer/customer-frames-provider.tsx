"use client";

import { ReactNode } from "react";

import Script from "next/script";

import { CheckoutFramesProvider } from "@/contexts/checkout-frames-context";
import { useScriptLoadWithTimeout } from "@/hooks/use-script-load-with-timeout";

export function CustomerCheckoutFramesProvider({
  checkoutComPublicKey,
  children,
}: {
  checkoutComPublicKey: string;
  children: ReactNode;
}) {
  const [isFramesScriptLoaded, markFramesScriptLoaded] =
    useScriptLoadWithTimeout();

  return (
    <>
      <Script
        onLoad={markFramesScriptLoaded}
        onReady={markFramesScriptLoaded}
        src="https://cdn.checkout.com/js/framesv2.min.js"
        strategy="afterInteractive"
      />
      <CheckoutFramesProvider
        isScriptLoaded={isFramesScriptLoaded}
        publicKey={checkoutComPublicKey}
      >
        {children}
      </CheckoutFramesProvider>
    </>
  );
}
