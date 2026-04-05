"use client";

import { useRouteMatch } from "@/hooks/use-route-match";

export function MobileBottomNavigationActiveState() {
  const { isCart, isCategory, isCustomer, isHome } = useRouteMatch();

  const activeTab = isHome
    ? "home"
    : isCategory
      ? "menu"
      : isCart
        ? "cart"
        : isCustomer
          ? "profile"
          : "";

  return (
    <span aria-hidden="true" className="peer hidden" data-active={activeTab} />
  );
}
