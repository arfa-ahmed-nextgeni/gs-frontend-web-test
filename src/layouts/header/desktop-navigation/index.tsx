import { DesktopNavigationContainer } from "@/layouts/header/desktop-navigation/desktop-navigation-container";
import { DesktopNavigationList } from "@/layouts/header/desktop-navigation/desktop-navigation-list";
import { ZIndexLevel } from "@/lib/constants/ui";
import { MainMenuType } from "@/lib/types/ui-types";

export const DesktopNavigation = ({
  isSticky,
  lowerZIndexLevel,
  navigationItems,
}: {
  isSticky: boolean;
  lowerZIndexLevel: ZIndexLevel;
  navigationItems: MainMenuType[];
}) => {
  return (
    <DesktopNavigationContainer
      isSticky={isSticky}
      zIndexLevel={lowerZIndexLevel}
    >
      <DesktopNavigationList navigationItems={navigationItems} />
    </DesktopNavigationContainer>
  );
};
