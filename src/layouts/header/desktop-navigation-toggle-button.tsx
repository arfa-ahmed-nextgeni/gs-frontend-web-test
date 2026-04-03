"use client";

import { CloseIcon } from "@/components/icons/close-icon";
import { MenuIcon } from "@/components/icons/menu-icon";
import {
  useHeaderActions,
  useHeaderState,
} from "@/layouts/header/header-container";

export const DesktopNavigationToggleButton = () => {
  const { showDesktopNavigation } = useHeaderState();
  const { toggleDesktopNavigation } = useHeaderActions();

  return (
    <button
      aria-expanded={showDesktopNavigation}
      aria-label={
        showDesktopNavigation ? "Close main navigation" : "Open main navigation"
      }
      onClick={toggleDesktopNavigation}
    >
      {showDesktopNavigation ? <CloseIcon /> : <MenuIcon />}
    </button>
  );
};
