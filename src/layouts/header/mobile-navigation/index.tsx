import { MobileNavigationContainer } from "@/layouts/header/mobile-navigation/mobile-navigation-container";
import { MobileNavigationList } from "@/layouts/header/mobile-navigation/mobile-navigation-list";
import { ZIndexLevel } from "@/lib/constants/ui";
import { MainMenuType } from "@/lib/types/ui-types";

export const MobileNavigation = ({
  isSticky = false,
  navigationItems,
  zIndexLevel,
}: {
  isSticky?: boolean;
  navigationItems: MainMenuType[];
  zIndexLevel: ZIndexLevel;
}) => {
  return (
    <MobileNavigationContainer isSticky={isSticky} zIndexLevel={zIndexLevel}>
      <MobileNavigationList navigationItems={navigationItems} />
    </MobileNavigationContainer>
  );
};
