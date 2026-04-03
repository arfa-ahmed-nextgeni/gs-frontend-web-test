"use client";

import { useSelectedLayoutSegment } from "next/navigation";

import { OrdersContextProvider } from "@/contexts/orders-context";
import { useIsMobile } from "@/hooks/use-is-mobile";

export default function CustomerOrdersLayout({
  children,
  drawer,
}: {
  children: React.ReactNode;
  drawer: React.ReactNode;
}) {
  const drawerSegment = useSelectedLayoutSegment("drawer");
  const isMobile = useIsMobile();

  const hasActiveDrawer = !!drawerSegment;

  return (
    <OrdersContextProvider>
      {hasActiveDrawer && isMobile ? null : children}
      {drawer}
    </OrdersContextProvider>
  );
}
