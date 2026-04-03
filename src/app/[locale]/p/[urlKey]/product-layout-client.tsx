"use client";

import { useSelectedLayoutSegment } from "next/navigation";

import { useIsMobile } from "@/hooks/use-is-mobile";

type ProductLayoutClientProps = {
  children: React.ReactNode;
  drawer: React.ReactNode;
};

export function ProductLayoutClient({
  children,
  drawer,
}: ProductLayoutClientProps) {
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
