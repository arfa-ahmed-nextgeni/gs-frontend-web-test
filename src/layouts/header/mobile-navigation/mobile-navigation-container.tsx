"use client";

import { PropsWithChildren, useEffect, useState } from "react";

import { BlurOverlay } from "@/components/ui/blur-overlay";
import { usePathname } from "@/i18n/navigation";
import {
  useHeaderActions,
  useHeaderState,
} from "@/layouts/header/header-container";
import { ZIndexLevel } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

export const MobileNavigationContainer = ({
  children,
  isSticky,
  zIndexLevel,
}: PropsWithChildren<{
  isSticky: boolean;
  zIndexLevel: ZIndexLevel;
}>) => {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  const { closeMobileNavigationMenu } = useHeaderActions();
  const { showStaticMobileNavigation, showStickyMobileNavigation } =
    useHeaderState();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    closeMobileNavigationMenu();
  }, [closeMobileNavigationMenu, pathname]);

  const showMobileNavigation = isSticky
    ? showStickyMobileNavigation
    : showStaticMobileNavigation;

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <nav
        className={cn(
          "scrollbar-hidden transition-default bg-bg-default absolute max-h-[70dvh] w-full overflow-y-auto pb-10 pt-5 lg:hidden",
          zIndexLevel,
          showMobileNavigation
            ? "translate-y-0"
            : "pointer-events-none -translate-y-full opacity-0"
        )}
        style={{ touchAction: "pan-y" }}
      >
        {children}
      </nav>
      <BlurOverlay
        onClick={closeMobileNavigationMenu}
        visible={showMobileNavigation}
        zIndexClass={ZIndexLevel.z5}
      />
    </>
  );
};
