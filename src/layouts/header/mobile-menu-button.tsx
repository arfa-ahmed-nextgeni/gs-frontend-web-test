"use client";

import { CloseIcon } from "@/components/icons/close-icon";
import { MenuIcon } from "@/components/icons/menu-icon";
import { useRouteMatch } from "@/hooks/use-route-match";
import { useHeaderContext } from "@/layouts/header/header-container";

export const MobileMenuButton = ({ isSticky }: { isSticky?: boolean }) => {
  const { isCustomer, isProduct } = useRouteMatch();

  const {
    showStaticMobileNavigation,
    showStickyMobileNavigation,
    toggleStaticMobileNavigation,
    toggleStickyMobileNavigation,
  } = useHeaderContext();

  // Hide menu when effective route is customer or product (including overlay from those)
  if (isCustomer || isProduct) {
    return null;
  }

  return (
    <div className="relative flex-shrink-0 lg:hidden">
      <button
        aria-label="Menu"
        className="transition-default flex flex-shrink-0 focus:outline-none"
        onClick={() => {
          if (isSticky) {
            toggleStickyMobileNavigation();
          } else {
            toggleStaticMobileNavigation();
          }
        }}
      >
        {isSticky ? (
          showStickyMobileNavigation ? (
            <CloseIcon />
          ) : (
            <MenuIcon />
          )
        ) : showStaticMobileNavigation ? (
          <CloseIcon />
        ) : (
          <MenuIcon />
        )}
      </button>
    </div>
  );
};
