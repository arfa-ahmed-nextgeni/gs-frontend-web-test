"use client";

import { ComponentProps, PropsWithChildren } from "react";

import cn from "classnames";

import { useCart } from "@/contexts/use-cart";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";

export const CartButton = ({
  children,
  className,
  indicatorProps,
  onClick,
}: PropsWithChildren<{
  className?: string;
  indicatorProps?: ComponentProps<"span">;
  onClick?: () => void;
}>) => {
  const { cartHasItems } = useCart();

  return (
    <Link
      aria-label="Cart button"
      className={cn(
        "relative flex h-auto shrink-0 transform items-center justify-center focus:outline-none",
        className
      )}
      href={ROUTES.CART.ROOT}
      onClick={onClick}
      prefetch={false}
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
