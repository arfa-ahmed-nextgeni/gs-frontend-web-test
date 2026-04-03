import { MobileNavigationItem } from "@/layouts/header/mobile-navigation/mobile-navigation-item";

import type { MainMenuType } from "@/lib/types/ui-types";

export const MobileNavigationList = ({
  navigationItems,
}: {
  navigationItems: MainMenuType[];
}) => {
  return (
    <div className="flex flex-col items-center gap-3">
      {navigationItems?.map((item, index) => (
        <MobileNavigationItem item={item} key={item.id} position={index + 1} />
      ))}
    </div>
  );
};
