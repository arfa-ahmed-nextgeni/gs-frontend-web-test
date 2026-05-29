import { DesktopNavigationContainer } from "@/layouts/header/desktop-navigation/desktop-navigation-container";
import { DesktopNavigationList } from "@/layouts/header/desktop-navigation/desktop-navigation-list";
import { ZIndexLevel } from "@/lib/constants/ui";
import { HeaderNavigationType } from "@/lib/types/ui-types";

export const DesktopNavigation = ({
  headerNavigation,
  isSticky,
  lowerZIndexLevel,
}: {
  headerNavigation: HeaderNavigationType;
  isSticky: boolean;
  lowerZIndexLevel: ZIndexLevel;
}) => {
  return (
    <DesktopNavigationContainer
      isSticky={isSticky}
      zIndexLevel={lowerZIndexLevel}
    >
      <DesktopNavigationList headerNavigation={headerNavigation} />
    </DesktopNavigationContainer>
  );
};
