"use client";

import { useRouteMatch } from "@/hooks/use-route-match";

export function MobileBottomNavigationActiveState() {
  const { isCart, isCustomer, isHome, isMenu } = useRouteMatch();

  const activeTab = isMenu
    ? "menu"
    : isHome
      ? "home"
      : isCart
        ? "cart"
        : isCustomer
          ? "profile"
          : "";

  return (
    <span aria-hidden="true" className="peer hidden" data-active={activeTab} />
  );
}
