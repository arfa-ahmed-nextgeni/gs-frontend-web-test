"use client";

import { type ReactNode } from "react";

import { useIsMobile } from "@/hooks/use-is-mobile";

import { CustomerServiceDialog } from "./customer-service-dialog";
import { CustomerServiceDrawer } from "./customer-service-drawer";

export function CustomerServiceOverlay({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();

  return isMobile ? (
    <CustomerServiceDrawer>{children}</CustomerServiceDrawer>
  ) : (
    <CustomerServiceDialog>{children}</CustomerServiceDialog>
  );
}
