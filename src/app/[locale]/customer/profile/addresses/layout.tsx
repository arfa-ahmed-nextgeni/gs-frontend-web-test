"use client";

import { useSelectedLayoutSegment } from "next/navigation";

import { useIsMobile } from "@/hooks/use-is-mobile";

export default function CustomerAddressesLayout({
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
    <>
      {hasActiveDrawer && isMobile ? null : children}
      {drawer}
    </>
  );
}
