"use client";

import { type MouseEvent, type PropsWithChildren } from "react";

import { useRouteMatch } from "@/hooks/use-route-match";
import { Link, useRouter } from "@/i18n/navigation";
import {
  MOBILE_MENU_OPEN_BOTTOM_TRANSITION_TYPES,
  shouldSkipMobileMenuViewTransition,
  storeMobileMenuOpenState,
} from "@/layouts/header/mobile-navigation/mobile-menu-view-transition";
import { ROUTES } from "@/lib/constants/routes";
import { MOBILE_BOTTOM_NAVIGATION_TRACKING_DATA_ATTRIBUTE } from "@/lib/constants/tracking-data-attributes";

export function MobileBottomNavigationMenuLink({
  children,
  className,
}: PropsWithChildren<{
  className: string;
}>) {
  const { isMenu, pathname } = useRouteMatch();
  const router = useRouter();

  const openMenu = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isMenu) {
      event.preventDefault();
      return;
    }

    if (isModifiedNavigationEvent(event)) {
      storeMobileMenuOpenState("bottom", pathname);
      return;
    }

    storeMobileMenuOpenState("bottom", pathname);

    if (shouldSkipMobileMenuViewTransition()) {
      event.preventDefault();
      router.push(ROUTES.MENU);
    }
  };

  return (
    <Link
      {...{ [MOBILE_BOTTOM_NAVIGATION_TRACKING_DATA_ATTRIBUTE]: "menu" }}
      aria-label="Menu"
      className={className}
      href={ROUTES.MENU}
      onClick={openMenu}
      prefetch="auto"
      title="Menu"
      transitionTypes={MOBILE_MENU_OPEN_BOTTOM_TRANSITION_TYPES}
    >
      {children}
    </Link>
  );
}

function isModifiedNavigationEvent(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.button !== 0
  );
}
