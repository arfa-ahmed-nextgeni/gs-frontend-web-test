import { DeferredStickyHeader } from "@/layouts/header/deferred-sticky-header";
import { HeaderBody } from "@/layouts/header/header-body";
import { HeaderContainer } from "@/layouts/header/header-container";
import { ZIndexLevel } from "@/lib/constants/ui";
import { PromoBanner } from "@/lib/models/promo-banner";
import { MainMenuType } from "@/lib/types/ui-types";
import { cn } from "@/lib/utils";

export const Header = ({
  navigationItems,
  promoBanner,
}: {
  navigationItems: MainMenuType[];
  promoBanner?: PromoBanner;
}) => {
  return (
    <HeaderContainer>
      <DeferredStickyHeader>
        <div
          className={cn(
            "sticky-header transition-default fixed left-0 right-0 top-0 w-full",
            ZIndexLevel.z20
          )}
        >
          <HeaderBody
            hoverZIndexLevel={ZIndexLevel.z15}
            isSticky
            lowerZIndexLevel={ZIndexLevel.z10}
            navigationItems={navigationItems}
            upperZIndexLevel={ZIndexLevel.z20}
          />
        </div>
      </DeferredStickyHeader>

      <div className={cn("static-header w-full", ZIndexLevel.z40)}>
        <HeaderBody
          hoverZIndexLevel={ZIndexLevel.z25}
          lowerZIndexLevel={ZIndexLevel.z20}
          navigationItems={navigationItems}
          promoBanner={promoBanner}
          upperZIndexLevel={ZIndexLevel.z40}
        />
      </div>
    </HeaderContainer>
  );
};
