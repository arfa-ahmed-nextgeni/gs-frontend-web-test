"use client";

import { useSelectedLayoutSegment } from "next/navigation";

import { useIsMobile } from "@/hooks/use-is-mobile";

export default function ProductLayout({
  children,
  drawer,
}: LayoutProps<"/[locale]/p/[urlKey]">) {
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
