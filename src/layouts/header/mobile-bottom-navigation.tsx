"use client";

import { useMobileModal } from "@/contexts/mobile-modal-context";
import { useIsMobileBottomNavHidden } from "@/hooks/use-is-mobile-bottom-nav-hidden";
import { useRouteMatch } from "@/hooks/use-route-match";
import { Link } from "@/i18n/navigation";
import { CartButton } from "@/layouts/header/cart-button";
import {
  MobileBottomNavigationBagIcon,
  MobileBottomNavigationCategoryIcon,
  MobileBottomNavigationHomeIcon,
  MobileBottomNavigationProfileIcon,
} from "@/layouts/header/mobile-bottom-navigation-icons";
import { trackMenuClick } from "@/lib/analytics/events";
import { ROUTES } from "@/lib/constants/routes";
import { ZIndexLevel } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const ACTIVE_NAV_ICON_COLOR = "#6543f5";
const DEFAULT_NAV_ICON_COLOR = "#374957";
const navIconClassName =
  "h-[clamp(1.25rem,7.634vw,1.75rem)] w-[clamp(1.25rem,7.634vw,1.75rem)]";

const HIDE_MOBILE_BOTTOM_NAV = process.env.NEXT_PUBLIC_HIDE_MOBILE_BOTTOM_NAV === "true";

export function MobileBottomNavigation() {
  const { isCart, isCategory, isCustomer, isHome } = useRouteMatch();
  const { isMobileModalOpen } = useMobileModal();

  const isMobileBottomNavHidden = useIsMobileBottomNavHidden();

  // Active states use effective pathname (overlay routes show underlying route's nav state)
  const activeStates = {
    account: isCustomer,
    cart: isCart,
    category: isCategory,
    home: isHome,
  };

  if (isMobileBottomNavHidden || isMobileModalOpen || HIDE_MOBILE_BOTTOM_NAV) return null;

  return (
    <>
      <div
        className={cn(
          "border-border-base bg-bg-default h-15 fixed bottom-0 flex w-full flex-row items-center justify-between border-t px-[clamp(2.5rem,6.25vw,3.125rem)] py-4 lg:hidden",
          ZIndexLevel.MobileBottomNavigation
        )}
        data-slot="mobile-bottom-navigation"
        style={{
          bottom: 0,
          left: 0,
          paddingBottom: "env(safe-area-inset-bottom)",
          position: "fixed",
          right: 0,
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)",
          zIndex: ZIndexLevel.MobileBottomNavigation,
        }}
      >
        <Link
          aria-label="Home"
          className={cn(
            "before:transition-default relative shrink-0 before:absolute before:bottom-[-8px] before:start-0 before:h-[3px] before:w-0 before:content-['']",
            {
              "before:bg-bg-brand before:w-full": activeStates.home,
            }
          )}
          href={ROUTES.HOME}
          onClick={() => trackMenuClick("home")}
          prefetch={false}
          title="Home"
        >
          <MobileBottomNavigationHomeIcon
            aria-hidden="true"
            className={navIconClassName}
            color={
              activeStates.home ? ACTIVE_NAV_ICON_COLOR : DEFAULT_NAV_ICON_COLOR
            }
          />
        </Link>

        <Link
          aria-label="Menu"
          className={cn(
            "before:transition-default relative shrink-0 before:absolute before:bottom-[-8px] before:start-0 before:h-[3px] before:w-0 before:content-['']",
            {
              "before:bg-bg-brand before:w-full": activeStates.category,
            }
          )}
          href={ROUTES.CATEGORY.BY_SLUG("fragrances")}
          onClick={() => trackMenuClick("menu")}
          prefetch={false}
          title="Menu"
        >
          <MobileBottomNavigationCategoryIcon
            aria-hidden="true"
            className={navIconClassName}
            color={
              activeStates.category
                ? ACTIVE_NAV_ICON_COLOR
                : DEFAULT_NAV_ICON_COLOR
            }
          />
        </Link>

        <CartButton
          className={cn(
            "before:transition-default relative shrink-0 before:absolute before:bottom-[-8px] before:start-0 before:h-[3px] before:w-0 before:content-['']",
            {
              "before:bg-bg-brand before:w-full": activeStates.cart,
            }
          )}
          onClick={() => trackMenuClick("cart")}
        >
          <MobileBottomNavigationBagIcon
            aria-hidden="true"
            className={navIconClassName}
            color={
              activeStates.cart ? ACTIVE_NAV_ICON_COLOR : DEFAULT_NAV_ICON_COLOR
            }
          />
        </CartButton>

        <Link
          aria-label="Profile"
          className={cn(
            "before:transition-default relative shrink-0 before:absolute before:bottom-[-8px] before:start-0 before:h-[3px] before:w-0 before:content-['']",
            {
              "before:bg-bg-brand before:w-full": activeStates.account,
            }
          )}
          href={ROUTES.CUSTOMER.ACCOUNT}
          onClick={() => trackMenuClick("profile")}
          prefetch={false}
          title="Profile"
        >
          <MobileBottomNavigationProfileIcon
            aria-hidden="true"
            className={navIconClassName}
            color={
              activeStates.account
                ? ACTIVE_NAV_ICON_COLOR
                : DEFAULT_NAV_ICON_COLOR
            }
          />
        </Link>
      </div>
    </>
  );
}
