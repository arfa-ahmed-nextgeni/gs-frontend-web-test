"use client";

import { useIsMobile } from "@/hooks/use-is-mobile";
import { useIsMobileBottomNavHidden } from "@/hooks/use-is-mobile-bottom-nav-hidden";
import { useRouteMatch } from "@/hooks/use-route-match";
import { usePathname } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

interface ConditionalHeaderFooterProps {
  children: React.ReactNode;
  footer: React.ReactNode;
  header: React.ReactNode;
  mobileNavigation: React.ReactNode;
}

const HIDE_HEADER = process.env.NEXT_PUBLIC_HIDE_HEADER === "true";

export function ConditionalHeaderFooter({
  children,
  footer,
  header,
  mobileNavigation,
}: ConditionalHeaderFooterProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { isAccount, isCart, isHome, isLogin } = useRouteMatch();
  const isMobileBottomNavHidden = useIsMobileBottomNavHidden();

  const isAccountPage = isAccount && isMobile;
  const isLoginPage = isLogin && isMobile;
  const isLandingPage = pathname === ROUTES.ROOT || pathname.includes("/lp/");
  const isCheckoutPage = pathname.includes("/checkout");

  // Effective pathname: overlay routes use underlying route for layout (header/footer)
  const shouldHideHeader =
    HIDE_HEADER || isAccountPage || isLoginPage || isCheckoutPage || (isCart && isMobile);
  const shouldHideFooter = (isCheckoutPage || !isLandingPage) && !isHome;

  return (
    <div className="flex min-h-dvh flex-col">
      {shouldHideHeader ? null : header}

      <main
        className={cn(
          "bg-bg-body pb-15 relative flex-grow flex-col lg:block lg:pb-0",
          {
            "flex pb-0": isMobileBottomNavHidden,
          }
        )}
        style={{
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}
      </main>

      {/* Hide footer on all pages except landing page */}
      {shouldHideFooter ? null : footer}

      {/* Hide mobile navigation only on login page */}
      {isLoginPage ? null : mobileNavigation}
    </div>
  );
}
