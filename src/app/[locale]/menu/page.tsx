import { ViewTransition } from "react";

import type { Metadata } from "next";

import { getLangDir } from "rtl-detect";

import { getMobileMenuViewTransitionProps } from "@/layouts/header/mobile-navigation/mobile-menu-view-transition";
import { MobileNavigationMenu } from "@/layouts/header/mobile-navigation/mobile-navigation-menu";
import { getPageLandingData } from "@/lib/actions/contentful/page-landing";
import { initializePageLocale } from "@/lib/utils/locale";
import { normalizeNavigationItems } from "@/lib/utils/normalize-navigation-items";

import { MenuDesktopRedirect } from "./menu-desktop-redirect";

import type { HeaderNavigationType } from "@/lib/types/ui-types";

export const metadata: Metadata = {
  robots: {
    follow: true,
    index: false,
  },
};

export default async function MenuPage({
  params,
}: PageProps<"/[locale]/menu">) {
  const { locale } = await params;
  initializePageLocale(locale);

  const pageLandingData = await getPageLandingData({ locale });
  const headerNavigation: HeaderNavigationType = {
    items: normalizeNavigationItems(pageLandingData?.siteNavigation?.items),
    menuHeaderLabel: pageLandingData?.siteNavigation?.menuHeaderLabel,
    seeAllLabel: pageLandingData?.siteNavigation?.seeAllLabel,
  };
  const menu = <MobileNavigationMenu headerNavigation={headerNavigation} />;

  return (
    <>
      <MenuDesktopRedirect />
      {getLangDir(locale) === "rtl" ? (
        menu
      ) : (
        <ViewTransition {...getMobileMenuViewTransitionProps()}>
          {menu}
        </ViewTransition>
      )}
    </>
  );
}
