import { getLocale } from "next-intl/server";

import { DeferredStickyHeader } from "@/layouts/header/deferred-sticky-header";
import { HeaderBody } from "@/layouts/header/header-body";
import { HeaderContainer } from "@/layouts/header/header-container";
import { getCatalogServiceBrands } from "@/lib/actions/category/get-catalog-service-brands";
import { type Locale } from "@/lib/constants/i18n";
import { ZIndexLevel } from "@/lib/constants/ui";
import { PromoBanner } from "@/lib/models/promo-banner";
import { HeaderNavigationType } from "@/lib/types/ui-types";
import { cn } from "@/lib/utils";
import { isOk } from "@/lib/utils/service-result";

export const Header = async ({
  headerNavigation,
  promoBanner,
}: {
  headerNavigation: HeaderNavigationType;
  promoBanner?: PromoBanner;
}) => {
  const locale = (await getLocale()) as Locale;
  const brandsResult = await getCatalogServiceBrands({ locale });
  const allBrands = isOk(brandsResult) ? brandsResult.data : [];

  return (
    <HeaderContainer allBrands={allBrands}>
      <DeferredStickyHeader>
        <div
          className={cn(
            "sticky-header transition-default fixed left-0 right-0 top-0 w-full",
            ZIndexLevel.z20
          )}
        >
          <HeaderBody
            headerNavigation={headerNavigation}
            hoverZIndexLevel={ZIndexLevel.z15}
            isSticky
            lowerZIndexLevel={ZIndexLevel.z10}
            upperZIndexLevel={ZIndexLevel.z20}
          />
        </div>
      </DeferredStickyHeader>

      <div className={cn("static-header w-full", ZIndexLevel.z40)}>
        <HeaderBody
          headerNavigation={headerNavigation}
          hoverZIndexLevel={ZIndexLevel.z25}
          lowerZIndexLevel={ZIndexLevel.z20}
          promoBanner={promoBanner}
          upperZIndexLevel={ZIndexLevel.z40}
        />
      </div>
    </HeaderContainer>
  );
};
