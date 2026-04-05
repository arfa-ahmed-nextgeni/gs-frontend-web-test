"use client";

import type { ReactNode } from "react";

import { useMobileModal } from "@/contexts/mobile-modal-context";
import { useIsMobile } from "@/hooks/use-is-mobile";
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
  const isMobile = useIsMobile();
  const { isAccount, isCart, isLogin, pathname } = useRouteMatch();

  const isAccountPage = isAccount && isMobile;
  const isLoginPage = isLogin && isMobile;
  const isCheckoutPage = pathname.includes("/checkout");
  const shouldHideHeader =
    isAccountPage || isLoginPage || isCheckoutPage || (isCart && isMobile);

  return shouldHideHeader ? null : children;
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
