"use client";

import type { ReactNode } from "react";

import { useMobileModal } from "@/contexts/mobile-modal-context";
import { getIsMobileBottomNavHidden } from "@/hooks/use-is-mobile-bottom-nav-hidden";
import { useRouteMatch } from "@/hooks/use-route-match";
import { ROUTES } from "@/lib/constants/routes";

export function ConditionalFooterGate({ children }: { children: ReactNode }) {
  const { isHome, pathname } = useRouteMatch();

  const isLandingPage = pathname === ROUTES.ROOT || pathname.includes("/lp/");
  const isCheckoutPage = pathname.includes("/checkout");
  const shouldHideFooter = (isCheckoutPage || !isLandingPage) && !isHome;

  return shouldHideFooter ? null : children;
}

export function ConditionalHeaderGate({ children }: { children: ReactNode }) {
  const { isAccount, isCart, isLogin, pathname } = useRouteMatch();

  const isCheckoutPage = pathname.includes("/checkout");

  if (isCheckoutPage) {
    return null;
  }

  const hideOnMobileOnly = isAccount || isLogin || isCart;

  if (hideOnMobileOnly) {
    return <div className="hidden lg:contents">{children}</div>;
  }

  return children;
}

export function ConditionalMainBottomNavigationSpacer() {
  const routeMatch = useRouteMatch();
  const isMobileBottomNavHidden = getIsMobileBottomNavHidden(routeMatch);

  return isMobileBottomNavHidden ? null : <div className="h-15 lg:hidden" />;
}

export function ConditionalMobileNavigationGate({
  children,
}: {
  children: ReactNode;
}) {
  const { isMobileModalOpen } = useMobileModal();
  const isMobileBottomNavHidden = getIsMobileBottomNavHidden(useRouteMatch());

  return isMobileBottomNavHidden || isMobileModalOpen ? null : children;
}
