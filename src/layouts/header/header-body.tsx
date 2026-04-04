import Container from "@/components/shared/container";
import { BlurOverlay } from "@/components/ui/blur-overlay";
import { DesktopNavigation } from "@/layouts/header/desktop-navigation";
import { HeaderRow } from "@/layouts/header/header-row";
import { PromotionalBanner } from "@/layouts/header/promotional-banner";
import { ZIndexLevel } from "@/lib/constants/ui";
import { PromoBanner } from "@/lib/models/promo-banner";
import { MainMenuType } from "@/lib/types/ui-types";

export const HeaderBody = ({
  hoverZIndexLevel = ZIndexLevel.z15,
  isSticky = false,
  lowerZIndexLevel = ZIndexLevel.z10,
  navigationItems,
  promoBanner,
  upperZIndexLevel = ZIndexLevel.z20,
}: {
  hoverZIndexLevel?: ZIndexLevel;
  isSticky?: boolean;
  lowerZIndexLevel?: ZIndexLevel;
  navigationItems: MainMenuType[];
  promoBanner?: PromoBanner;
  upperZIndexLevel?: ZIndexLevel;
}) => {
  return (
    <>
      {promoBanner && !isSticky && (
        <Container
          className={`relative ${upperZIndexLevel}`}
          variant="FullWidth"
        >
          <PromotionalBanner data={promoBanner} />
        </Container>
      )}

      <HeaderRow
        hoverZIndexLevel={hoverZIndexLevel}
        isSticky={isSticky}
        zIndexLevel={upperZIndexLevel}
      />

      <DesktopNavigation
        isSticky={isSticky}
        lowerZIndexLevel={lowerZIndexLevel}
        navigationItems={navigationItems}
      />

      {/* <MobileNavigation
        isSticky={isSticky}
        navigationItems={navigationItems}
        zIndexLevel={lowerZIndexLevel}
      /> */}

      <BlurOverlay />
    </>
  );
};
