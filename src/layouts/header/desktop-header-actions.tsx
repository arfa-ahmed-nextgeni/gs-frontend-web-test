"use client";

import { CartIcon } from "@/components/icons/cart-icon";
import { AuthDropdown } from "@/layouts/header/auth-dropdown";
import { CartButton } from "@/layouts/header/cart-button";
import { DesktopNavigationToggleButton } from "@/layouts/header/desktop-navigation-toggle-button";
import { ZIndexLevel } from "@/lib/constants/ui";

export const DesktopHeaderActions = ({
  hoverZIndexLevel,
  isSticky,
}: {
  hoverZIndexLevel: ZIndexLevel;
  isSticky: boolean;
}) => {
  return (
    <div className="flex flex-row items-center gap-5">
      <CartButton>
        <CartIcon />
      </CartButton>
      <AuthDropdown hoverZIndexLevel={hoverZIndexLevel} />
      {isSticky ? <DesktopNavigationToggleButton /> : null}
    </div>
  );
};
