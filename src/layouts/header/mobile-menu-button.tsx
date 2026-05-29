"use client";

import { type MouseEvent, useEffect, useRef, useTransition } from "react";

// eslint-disable-next-line no-restricted-imports
import { useLinkStatus } from "next/link";

import { CloseIcon } from "@/components/icons/close-icon";
import { MenuIcon } from "@/components/icons/menu-icon";
import { Spinner } from "@/components/ui/spinner";
import { useRouteMatch } from "@/hooks/use-route-match";
import { Link, useRouter } from "@/i18n/navigation";
import {
  clearMobileMenuOpenState,
  MOBILE_MENU_OPEN_HEADER_TRANSITION_TYPES,
  readMobileMenuCloseState,
  shouldSkipMobileMenuViewTransition,
  storeMobileMenuOpenState,
} from "@/layouts/header/mobile-navigation/mobile-menu-view-transition";
import { ROUTES } from "@/lib/constants/routes";

export const MobileMenuButton = () => {
  const { isCustomer, isMenu, isProduct, pathname } = useRouteMatch();
  const [isPending, startNavigationTransition] = useTransition();
  const shouldClearOpenStateRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (!isMenu && shouldClearOpenStateRef.current) {
      clearMobileMenuOpenState();
      shouldClearOpenStateRef.current = false;
    }
  }, [isMenu]);

  const closeMenu = () => {
    const { hasBackNavigation, returnTo } = readMobileMenuCloseState();

    startNavigationTransition(() => {
      if (hasBackNavigation) {
        shouldClearOpenStateRef.current = true;
        router.back();
        return;
      }

      clearMobileMenuOpenState();
      router.replace(returnTo, { scroll: false });
    });
  };

  const handleOpenMenuClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isModifiedNavigationEvent(event)) {
      storeMobileMenuOpenState("header", pathname);
    }
  };

  const handleOpenMenuNavigate = () => {
    storeMobileMenuOpenState("header", pathname);
  };

  // Hide menu when effective route is customer or product (including overlay from those)
  if (isCustomer || isProduct) {
    return null;
  }

  return (
    <div className="relative shrink-0 lg:hidden">
      {isMenu ? (
        <button
          aria-busy={isPending}
          aria-current="page"
          aria-label="Close menu"
          className="transition-default flex shrink-0 focus:outline-none"
          disabled={isPending}
          onClick={closeMenu}
          type="button"
        >
          {isPending ? (
            <Spinner className="size-5" size={20} variant="dark" />
          ) : (
            <CloseIcon />
          )}
        </button>
      ) : (
        <Link
          aria-label="Menu"
          className="transition-default flex shrink-0 focus:outline-none"
          href={ROUTES.MENU}
          onClick={handleOpenMenuClick}
          onNavigate={handleOpenMenuNavigate}
          prefetch="auto"
          transitionTypes={
            shouldSkipMobileMenuViewTransition()
              ? undefined
              : MOBILE_MENU_OPEN_HEADER_TRANSITION_TYPES
          }
        >
          <OpenMenuIcon />
        </Link>
      )}
    </div>
  );
};

function isModifiedNavigationEvent(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.button !== 0
  );
}

const OpenMenuIcon = () => {
  const { pending } = useLinkStatus();

  if (pending) {
    return <Spinner className="size-5" size={20} variant="dark" />;
  }

  return <MenuIcon />;
};
