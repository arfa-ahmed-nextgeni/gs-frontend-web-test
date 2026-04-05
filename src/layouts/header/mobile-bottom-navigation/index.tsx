import { Link } from "@/i18n/navigation";
import { CartButton } from "@/layouts/header/cart-button";
import { MobileBottomNavigationActiveState } from "@/layouts/header/mobile-bottom-navigation/mobile-bottom-navigation-active-state";
import {
  MobileBottomNavigationBagIcon,
  MobileBottomNavigationCategoryIcon,
  MobileBottomNavigationHomeIcon,
  MobileBottomNavigationProfileIcon,
} from "@/layouts/header/mobile-bottom-navigation/mobile-bottom-navigation-icons";
import { ROUTES } from "@/lib/constants/routes";
import { MENU_TRACKING_DATA_ATTRIBUTE } from "@/lib/constants/tracking-data-attributes";
import { ZIndexLevel } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const navIconClassName =
  "h-[clamp(1.25rem,7.634vw,1.75rem)] w-[clamp(1.25rem,7.634vw,1.75rem)]";

const navItemActiveClassNames = {
  cart: [
    "peer-data-[active=cart]:text-[#6543f5]",
    "peer-data-[active=cart]:before:bg-bg-brand",
    "peer-data-[active=cart]:before:w-full",
  ].join(" "),
  home: [
    "peer-data-[active=home]:text-[#6543f5]",
    "peer-data-[active=home]:before:bg-bg-brand",
    "peer-data-[active=home]:before:w-full",
  ].join(" "),
  menu: [
    "peer-data-[active=menu]:text-[#6543f5]",
    "peer-data-[active=menu]:before:bg-bg-brand",
    "peer-data-[active=menu]:before:w-full",
  ].join(" "),
  profile: [
    "peer-data-[active=profile]:text-[#6543f5]",
    "peer-data-[active=profile]:before:bg-bg-brand",
    "peer-data-[active=profile]:before:w-full",
  ].join(" "),
} as const;

export function MobileBottomNavigation() {
  return (
    <div
      className={cn(
        "border-border-base bg-bg-default h-15 fixed bottom-0 flex w-full flex-row items-center justify-between border-t px-[clamp(2.5rem,6.25vw,3.125rem)] py-4 lg:hidden",
        ZIndexLevel.MobileBottomNavigation,
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
      <MobileBottomNavigationActiveState />

      <Link
        {...{ [MENU_TRACKING_DATA_ATTRIBUTE]: "home" }}
        aria-label="Home"
        className={getNavItemClassName("home")}
        href={ROUTES.HOME}
        title="Home"
      >
        <MobileBottomNavigationHomeIcon
          aria-hidden="true"
          className={navIconClassName}
        />
      </Link>

      <Link
        {...{ [MENU_TRACKING_DATA_ATTRIBUTE]: "menu" }}
        aria-label="Menu"
        className={getNavItemClassName("menu")}
        href={ROUTES.CATEGORY.BY_SLUG("fragrances")}
        title="Menu"
      >
        <MobileBottomNavigationCategoryIcon
          aria-hidden="true"
          className={navIconClassName}
        />
      </Link>

      <CartButton className={getNavItemClassName("cart")} trackingMenu="cart">
        <MobileBottomNavigationBagIcon
          aria-hidden="true"
          className={navIconClassName}
        />
      </CartButton>

      <Link
        {...{ [MENU_TRACKING_DATA_ATTRIBUTE]: "profile" }}
        aria-label="Profile"
        className={getNavItemClassName("profile")}
        href={ROUTES.CUSTOMER.ACCOUNT}
        title="Profile"
      >
        <MobileBottomNavigationProfileIcon
          aria-hidden="true"
          className={navIconClassName}
        />
      </Link>
    </div>
  );
}

function getNavItemClassName(activeTab: "cart" | "home" | "menu" | "profile") {
  return cn(
    "text-[#374957] before:transition-default relative shrink-0 before:absolute before:bottom-[-8px] before:start-0 before:h-[3px] before:w-0 before:content-['']",
    navItemActiveClassNames[activeTab],
  );
}
