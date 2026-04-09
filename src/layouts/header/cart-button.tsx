"use client";

import { ComponentProps, PropsWithChildren } from "react";

import cn from "classnames";

import { useCart } from "@/contexts/use-cart";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { MOBILE_BOTTOM_NAVIGATION_TRACKING_DATA_ATTRIBUTE } from "@/lib/constants/tracking-data-attributes";

export const CartButton = ({
  children,
  className,
  indicatorProps,
  mobileBottomNavigationTrackingItem,
  onClick,
}: PropsWithChildren<{
  className?: string;
  indicatorProps?: ComponentProps<"span">;
  mobileBottomNavigationTrackingItem?: string;
  onClick?: () => void;
}>) => {
  const { cartHasItems } = useCart();

  return (
    <Link
      {...(mobileBottomNavigationTrackingItem
        ? {
            [MOBILE_BOTTOM_NAVIGATION_TRACKING_DATA_ATTRIBUTE]:
              mobileBottomNavigationTrackingItem,
          }
        : undefined)}
      aria-label="Cart button"
      className={cn(
        "relative flex h-auto shrink-0 transform items-center justify-center focus:outline-none",
        className
      )}
      href={ROUTES.CART.ROOT}
      onClick={onClick}
    >
      {children}
      {cartHasItems && (
        <span
          className={cn(
            "bg-bg-danger absolute end-0 top-0 size-3 rounded-full lg:size-2",
            indicatorProps?.className
          )}
        />
      )}
    </Link>
  );
};
