import { PropsWithChildren, Suspense } from "react";

import { NextIntlClientProvider } from "next-intl";
import { getLangDir } from "rtl-detect";

import { GoogleAnalyticsWrapper } from "@/app/[locale]/_components/google-analytics-wrapper";
import { GoogleTagManagerWrapper } from "@/app/[locale]/_components/google-tag-manager-wrapper";
import Providers from "@/app/provider/provider";
import { CookieConsentSheetContainer } from "@/components/cookie-consent";
import { OpenAppSheetContainer } from "@/components/open-app-prompt/open-app-sheet-container";
import { GlobalLinkLoadingBar } from "@/components/ui/global-link-loading-bar";
import { CookieConsentProvider } from "@/contexts/cookie-consent-context";
import { WebsiteFooterProvider } from "@/contexts/website-footer-context";
import { getPageLandingData } from "@/lib/actions/contentful/page-landing";
import { Locale } from "@/lib/constants/i18n";
import { PromoBanner } from "@/lib/models/promo-banner";
import { WebsiteFooter } from "@/lib/models/website-footer";
import { MainMenuType } from "@/lib/types/ui-types";
import { normalizeStyles } from "@/lib/utils/style-normalization";

import type { CookieConsentPromptModel } from "@/lib/models/cookie-consent-prompt-model";
import type { OpenAppPromptModel } from "@/lib/models/open-app-prompt-model";
import { ConditionalHeaderFooter } from "@/components/layout/conditional-header-footer";

export async function AppRootProvider({
  children,
  locale,
}: PropsWithChildren<{ locale: Locale }>) {
  const [pageLandingResult] = await Promise.allSettled([
    getPageLandingData({ locale }),
  ]);

  let cookieConsentPrompt: CookieConsentPromptModel | undefined;
  let navigationItems: MainMenuType[] = [];
  let websiteFooter: undefined | WebsiteFooter;
  let promoBanner: PromoBanner | undefined;
  let openAppPrompt: OpenAppPromptModel | undefined;

  if (pageLandingResult.status === "fulfilled" && pageLandingResult.value) {
    const pageData = pageLandingResult.value;
    navigationItems = (pageData.siteNavigation?.items ?? []).map((item) => ({
      id: String(item.id),
      label: item.label,
      path: item.path,
      style: normalizeStyles(item.style),
      subMenu: item.subMenu?.map((sub) => ({
        ...sub,
        id: String(sub.id),
        style: normalizeStyles(sub.style),
      })),
    }));
    cookieConsentPrompt = pageData.cookieConsentPrompt;
    websiteFooter = pageData.websiteFooter;
    promoBanner = pageData.promoBanner;
    openAppPrompt = pageData.openAppPrompt;
  }

  const direction = getLangDir(locale);

  return (
    <NextIntlClientProvider>
      <CookieConsentProvider
        cookieConsentPrompt={structuredClone(cookieConsentPrompt)}
      >
        <WebsiteFooterProvider websiteFooter={structuredClone(websiteFooter)}>
          <Providers dir={direction}>
            <GlobalLinkLoadingBar />
            <ConditionalHeaderFooter
              navigationItems={navigationItems}
              promoBanner={promoBanner}
              websiteFooter={websiteFooter}
            >
              {children}
            </ConditionalHeaderFooter>
            <CookieConsentSheetContainer
              cookieConsentPrompt={structuredClone(cookieConsentPrompt)}
            />
            <OpenAppSheetContainer
              openAppPrompt={structuredClone(openAppPrompt)}
            />
          </Providers>
        </WebsiteFooterProvider>
        <GoogleAnalyticsWrapper />
        <GoogleTagManagerWrapper />
      </CookieConsentProvider>
    </NextIntlClientProvider>
  );
}
