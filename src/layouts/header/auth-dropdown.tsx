"use client";

import React, { useState } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import AddressIcon from "@/assets/icons/address-icon.svg";
import CustomerServiceIcon from "@/assets/icons/customer-service-icon.svg";
import LogOutIcon from "@/assets/icons/log-out-icon.svg";
import CardsIcon from "@/assets/icons/my-cards-icon.svg";
import OrdersIcon from "@/assets/icons/orders-icon.svg";
import ProfileMenuIcon from "@/assets/icons/profile-menu-icon.svg";
import { ProfileIcon } from "@/components/icons/profile-icon";
import { BlurDiv } from "@/components/ui/blur-div";
import { useAuthUI } from "@/contexts/auth-ui-context";
import { useBlurContext } from "@/contexts/blur-context";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useUI } from "@/contexts/use-ui";
import { useStoreCode } from "@/hooks/i18n/use-store-code";
import { useLogout } from "@/hooks/use-logout";
import { Link, usePathname } from "@/i18n/navigation";
import { trackMenuClick } from "@/lib/analytics/events";
import { StoreCode } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import { ZIndexLevel } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const accountMenuOptions = [
  {
    href: ROUTES.CUSTOMER.PROFILE.ROOT,
    icon: ProfileMenuIcon,
    id: "profile",
  },
  {
    href: ROUTES.CUSTOMER.ORDERS,
    icon: OrdersIcon,
    id: "orders",
  },
  {
    href: ROUTES.CUSTOMER.PROFILE.ADDRESSES.ROOT,
    icon: AddressIcon,
    id: "address",
  },
  {
    href: ROUTES.CUSTOMER.CARDS,
    icon: CardsIcon,
    id: "myCards",
    visibleInStores: [StoreCode.ar_sa, StoreCode.en_sa],
  },
  {
    href: ROUTES.CUSTOMER_SERVICE,
    icon: CustomerServiceIcon,
    id: "customerService",
  },
  {
    href: ROUTES.LOGOUT,
    icon: LogOutIcon,
    id: "logout",
  },
];

export function AuthDropdown({
  hoverZIndexLevel,
}: {
  hoverZIndexLevel: ZIndexLevel;
}) {
  const pathname = usePathname();

  const { storeCode } = useStoreCode();
  const { storeConfig } = useStoreConfig();
  const checkoutPayEnabled = storeConfig?.checkoutPayEnabled ?? false;

  const t = useTranslations("HomePage.header.authDropdown");
  const { isAuthorized } = useUI();
  const { logout } = useLogout();
  const { clearHoverStack } = useBlurContext();
  const { showOtpLoginPopup } = useAuthUI();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleProfileClick = () => {
    if (!isAuthorized) {
      showOtpLoginPopup();
    }
  };

  const handleLogout = async () => {
    trackMenuClick("logout");
    await logout(storeCode);
    setIsMenuOpen(false);
    // Clear any active blur effects
    clearHoverStack();
  };

  const handleLinkClick = (menuId: string) => {
    trackMenuClick(menuId);
    setIsMenuOpen(false);
  };

  const handleMouseEnter = () => {
    setIsMenuOpen(true);
  };

  const handleMouseLeave = () => {
    setIsMenuOpen(false);
  };

  const visibleOptions = accountMenuOptions.filter((e) => {
    // Filter by store visibility
    if (e.visibleInStores && !e.visibleInStores.includes(storeCode)) {
      return false;
    }
    // Filter out Cards if checkoutPayEnabled is false
    if (e.id === "myCards" && !checkoutPayEnabled) {
      return false;
    }
    return true;
  });

  return (
    <>
      {isAuthorized ? (
        <BlurDiv
          className="group relative flex h-full items-center"
          hoverLevel={hoverZIndexLevel}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <ProfileIcon />

          <div
            className={cn(
              "group/list rounded-t-0 transition-default bg-bg-default absolute top-[var(--desktop-header-height)] w-[190px] overflow-hidden rounded-b-xl rounded-t-none border-0 p-0",
              "ltr:-translate-x-[85%] rtl:translate-x-[85%]",
              "xl:ltr:-translate-x-1/2 xl:rtl:translate-x-1/2",
              isMenuOpen ? "max-h-100" : "max-h-0"
            )}
          >
            {visibleOptions.map(({ href, icon, id }) => {
              const isDefaultSelected = pathname === href;
              if (id === "logout") {
                return (
                  <button
                    className={cn(
                      "border-border-base transition-default flex w-full flex-row items-center gap-2 border-b px-4 py-2 last:border-none",
                      "hover:bg-bg-surface hover:pl-6 hover:pr-4 rtl:hover:pl-4 rtl:hover:pr-6",
                      {
                        "bg-bg-surface group-hover/list:bg-bg-default ps-6":
                          isDefaultSelected,
                      },
                      {
                        "group-hover/list:pl-4 rtl:group-hover/list:pr-4":
                          isDefaultSelected,
                      }
                    )}
                    key={id}
                    onClick={handleLogout}
                  >
                    <Image
                      alt="icon"
                      className="aspect-square"
                      height={15}
                      src={icon}
                      unoptimized
                      width={15}
                    />
                    <span className="text-text-danger text-sm font-medium">
                      {t(id as any)}
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  className={cn(
                    "border-border-base transition-default hover:bg-bg-surface flex flex-row items-center gap-2 border-b px-4 py-2 last:border-none",
                    "hover:pl-6 hover:pr-4 rtl:hover:pl-4 rtl:hover:pr-6",
                    {
                      "bg-bg-surface group-hover/list:bg-bg-default ps-6":
                        isDefaultSelected,
                    },
                    {
                      "group-hover/list:pl-4 rtl:group-hover/list:pr-4":
                        isDefaultSelected,
                    }
                  )}
                  href={href}
                  key={id}
                  onClick={() => handleLinkClick(id)}
                >
                  <Image
                    alt="icon"
                    className="aspect-square"
                    height={15}
                    src={icon}
                    unoptimized
                    width={15}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      id === "logout" ? "text-text-danger" : "text-text-primary"
                    )}
                  >
                    {t(id as any)}
                  </span>
                </Link>
              );
            })}
          </div>
        </BlurDiv>
      ) : (
        <div className="relative">
          <div className="cart-button" onClick={handleProfileClick}>
            <ProfileIcon />
          </div>
        </div>
      )}
    </>
  );
}
