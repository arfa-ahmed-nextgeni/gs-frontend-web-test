import type { ReactNode } from "react";

import {
  ConditionalFooterGate,
  ConditionalHeaderGate,
  ConditionalMainBottomNavigationSpacer,
  ConditionalMobileNavigationGate,
} from "@/components/layout/conditional-header-footer-gates";
import { Footer } from "@/layouts/footer";
import { Header } from "@/layouts/header";
import { MobileBottomNavigation } from "@/layouts/header/mobile-bottom-navigation";

import type { PromoBanner } from "@/lib/models/promo-banner";
import type { WebsiteFooter } from "@/lib/models/website-footer";
import type { MainMenuType } from "@/lib/types/ui-types";

interface ConditionalHeaderFooterProps {
  children: ReactNode;
  navigationItems: MainMenuType[];
  promoBanner?: PromoBanner;
  websiteFooter?: WebsiteFooter;
}

export function ConditionalHeaderFooter({
  children,
  navigationItems,
  promoBanner,
  websiteFooter,
}: ConditionalHeaderFooterProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <ConditionalHeaderGate>
        <Header navigationItems={navigationItems} promoBanner={promoBanner} />
      </ConditionalHeaderGate>

      <main
        className="bg-bg-body relative grow flex-col lg:block"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
        <ConditionalMainBottomNavigationSpacer />
      </main>

      <ConditionalFooterGate>
        <Footer websiteFooter={websiteFooter} />
      </ConditionalFooterGate>

      <ConditionalMobileNavigationGate>
        <MobileBottomNavigation />
      </ConditionalMobileNavigationGate>
    </div>
  );
}
