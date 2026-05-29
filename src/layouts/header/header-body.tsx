import Container from "@/components/shared/container";
import { BlurOverlay } from "@/components/ui/blur-overlay";
import { DesktopNavigation } from "@/layouts/header/desktop-navigation";
import { HeaderRow } from "@/layouts/header/header-row";
import { PromotionalBanner } from "@/layouts/header/promotional-banner";
import { ZIndexLevel } from "@/lib/constants/ui";
import { PromoBanner } from "@/lib/models/promo-banner";
import { HeaderNavigationType } from "@/lib/types/ui-types";

export const HeaderBody = ({
  headerNavigation,
  hoverZIndexLevel = ZIndexLevel.z15,
  isSticky = false,
  lowerZIndexLevel = ZIndexLevel.z10,
  promoBanner,
  upperZIndexLevel = ZIndexLevel.z20,
}: {
  headerNavigation: HeaderNavigationType;
  hoverZIndexLevel?: ZIndexLevel;
  isSticky?: boolean;
  lowerZIndexLevel?: ZIndexLevel;
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
        headerNavigation={headerNavigation}
        isSticky={isSticky}
        lowerZIndexLevel={lowerZIndexLevel}
      />

      <BlurOverlay />
    </>
  );
};
