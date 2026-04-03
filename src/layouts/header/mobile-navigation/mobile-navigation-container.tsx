"use client";

import { PropsWithChildren, useEffect, useState } from "react";

import { useLocale } from "next-intl";

import { BlurOverlay } from "@/components/ui/blur-overlay";
import { usePathname } from "@/i18n/navigation";
import { useHeaderContext } from "@/layouts/header/header-container";
import { ZIndexLevel } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

export const MobileNavigationContainer = ({
  children,
  isSticky,
}: PropsWithChildren<{
  isSticky: boolean;
  zIndexLevel: ZIndexLevel;
}>) => {
  const locale = useLocale();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  const {
    closeMobileNavigationMenu,
    showStaticMobileNavigation,
    showStickyMobileNavigation,
  } = useHeaderContext();

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

  if (!showMobileNavigation) {
    return null;
  }

  const promoBannerHeight = locale.includes("ar") ? "35px" : "50px";
  return (
    <>
      <nav
        className={cn(
          "scrollbar-hidden transition-default bg-bg-default z-51 fixed inset-x-0 top-0 max-h-[70dvh] w-full overflow-y-auto pb-10 pt-5 lg:hidden",
          "translate-y-0"
        )}
        style={{
          marginTop: isSticky
            ? "var(--mobile-header-height)"
            : `calc(var(--mobile-header-height) + ${promoBannerHeight})`,
          touchAction: "pan-y",
        }}
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
