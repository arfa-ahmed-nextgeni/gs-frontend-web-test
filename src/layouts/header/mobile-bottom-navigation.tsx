"use client";

import Image from "next/image";

import SelectedBagMobileIcon from "@/assets/icons/bag-icon-active.svg";
import BagMobileIcon from "@/assets/icons/bag-icon.svg";
import SelectedCategoryMobileIcon from "@/assets/icons/category-icon-active.svg";
import CategoryMobileIcon from "@/assets/icons/category-icon.svg";
import SelectedHomeMobileIcon from "@/assets/icons/home-icon-active.svg";
import HomeMobileIcon from "@/assets/icons/home-icon.svg";
import SelectedProfileMobileIcon from "@/assets/icons/profile-icon-active.svg";
import ProfileMobileIcon from "@/assets/icons/profile-icon.svg";
import { useMobileModal } from "@/contexts/mobile-modal-context";
import { useIsMobileBottomNavHidden } from "@/hooks/use-is-mobile-bottom-nav-hidden";
import { useRouteMatch } from "@/hooks/use-route-match";
import { Link } from "@/i18n/navigation";
import { CartButton } from "@/layouts/header/cart-button";
import { trackMenuClick } from "@/lib/analytics/events";
import { ROUTES } from "@/lib/constants/routes";
import { ZIndexLevel } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

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

  if (isMobileBottomNavHidden || isMobileModalOpen) return null;

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
          <Image
            alt="Home"
            className="h-[clamp(1.25rem,7.634vw,1.75rem)] w-[clamp(1.25rem,7.634vw,1.75rem)]"
            height={30}
            src={activeStates.home ? SelectedHomeMobileIcon : HomeMobileIcon}
            width={30}
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
          <Image
            alt="Menu"
            className="h-[clamp(1.25rem,7.634vw,1.75rem)] w-[clamp(1.25rem,7.634vw,1.75rem)]"
            height={30}
            src={
              activeStates.category
                ? SelectedCategoryMobileIcon
                : CategoryMobileIcon
            }
            width={30}
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
          <Image
            alt="Cart"
            className="h-[clamp(1.25rem,7.634vw,1.75rem)] w-[clamp(1.25rem,7.634vw,1.75rem)]"
            height={30}
            src={activeStates.cart ? SelectedBagMobileIcon : BagMobileIcon}
            width={30}
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
          <Image
            alt="Profile"
            className="h-[clamp(1.25rem,7.634vw,1.75rem)] w-[clamp(1.25rem,7.634vw,1.75rem)]"
            height={30}
            src={
              activeStates.account
                ? SelectedProfileMobileIcon
                : ProfileMobileIcon
            }
            width={30}
          />
        </Link>
      </div>
    </>
  );
}
