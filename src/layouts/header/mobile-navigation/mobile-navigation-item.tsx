import { MobileNavigationLink } from "@/layouts/header/mobile-navigation/mobile-navigation-link";
import { MobileNavigationSubmenu } from "@/layouts/header/mobile-navigation/mobile-navigation-submenu";

import type { MainMenuType } from "@/lib/types/ui-types";

export const MobileNavigationItem = ({
  item,
  position,
}: {
  item: MainMenuType;
  position: number;
}) => {
  const hasSubmenu = Array.isArray(item.subMenu);

  if (hasSubmenu) {
    return <MobileNavigationSubmenu item={item} position={position} />;
  }

  return (
    <MobileNavigationLink
      activePath={item.path}
      className="transition-default before:transition-default focus:before:bg-bg-success text-text-primary relative inline-flex items-center text-xl font-medium before:absolute before:bottom-[-1px] before:start-0 before:h-[4px] before:w-0 before:content-[''] focus:outline-none focus:before:w-full"
      href={item.path}
      label={item.label}
      position={position}
      style={item.style}
    />
  );
};
