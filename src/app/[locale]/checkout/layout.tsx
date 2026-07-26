import { ReactNode } from "react";

import { CHECKOUT_PUBLIC_API_KEY } from "@/lib/config/server-env";

import CheckoutLayoutClient from "./checkout-layout-client";

export default function CheckoutLayout({
  children,
  drawer,
}: {
  children: ReactNode;
  drawer: ReactNode;
}) {
  return (
    <CheckoutLayoutClient
      checkoutComPublicKey={CHECKOUT_PUBLIC_API_KEY}
      drawer={drawer}
    >
      {children}
    </CheckoutLayoutClient>
  );
}
