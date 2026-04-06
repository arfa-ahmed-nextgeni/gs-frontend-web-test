import type { CSSProperties } from "react";

import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";

import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { getLangDir } from "rtl-detect";
import { Toaster } from "sonner";

import { AppRootProvider } from "@/app/[locale]/_components/app-root-provider";
import { NewRelicBrowserAgent } from "@/components/analytics/new-relic-browser-agent";
import { LocaleFontPreload } from "@/components/common/locale-font-preload";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SpinnerAssetsPreloader } from "@/components/ui/spinner-assets-preloader";
import { routing } from "@/i18n/routing";
import { getStoresConfig } from "@/lib/actions/config/get-stores-config";
import { getPageLandingData } from "@/lib/actions/contentful/page-landing";
import { PROTOCOL } from "@/lib/constants/environment";
import { LOCALE_TO_DOMAIN } from "@/lib/constants/i18n";
import { Stores } from "@/lib/models/stores";
import { getLocaleInfo, initializePageLocale } from "@/lib/utils/locale";
import { generateOrganizationSchema } from "@/lib/utils/schema";
import { isOk } from "@/lib/utils/service-result";

import type { Locale } from "@/lib/constants/i18n";

import "../globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await rootLocale();

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({
    locale,
    namespace: "HomePage.metaData",
  });

  // Fetch page landing data to get SEO component
  const pageLandingData = await getPageLandingData({
    locale,
  });

  const seo = pageLandingData?.seo;
  const title = seo?.pageTitle?.trim() || t("title");
  const description = seo?.pageDescription?.trim() || t("description");
  const localeDomain = LOCALE_TO_DOMAIN[locale as Locale];
  const metadataBaseUrl =
    localeDomain && localeDomain.length > 0
      ? `${PROTOCOL}://${localeDomain}`
      : (process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3000");

  const shareImages =
    seo?.shareImageUrls?.length &&
    seo.shareImageUrls.every((url) => url.startsWith("http"))
      ? seo.shareImageUrls.slice(0, 3).map((url) => ({
          height: 630,
          url,
          width: 1200,
        }))
      : [
          {
            height: 630,
            url: "/logo-512x512.png",
            width: 1200,
          },
        ];

  return {
    description,
    icons: {
      apple: [{ url: "/apple-touch-icon.png" }],
      icon: [
        { sizes: "any", url: "/favicon.ico" },
        { sizes: "16x16", type: "image/png", url: "/favicon-16x16.png" },
        { sizes: "32x32", type: "image/png", url: "/favicon-32x32.png" },
        {
          sizes: "192x192",
          type: "image/png",
          url: "/logo-192x192.png",
        },
        {
          sizes: "512x512",
          type: "image/png",
          url: "/logo-512x512.png",
        },
      ],
    },
    keywords: t("keywords"),
    metadataBase: new URL(metadataBaseUrl),
    openGraph: {
      description,
      images: shareImages,
      locale: locale,
      siteName: "Golden Scent",
      title,
      type: "website",
    },
    robots: {
      follow: !seo?.nofollow,
      index: !seo?.noindex,
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: shareImages.map((img) => img.url),
      title,
    },
  };
}

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  width: "device-width",
};

export async function generateStaticParams() {
  try {
    const response = await getStoresConfig();

    if (response && isOk(response)) {
      const stores = new Stores(response.data);
      const params = stores.getAll().map((store) => ({
        locale: store.locale,
      }));

      // Ensure we have valid params
      if (params.length > 0) {
        return params;
      }
    }
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
  }

  // Fallback to routing locales
  return routing.locales.map((locale) => ({
    locale: locale as string,
  }));
}

export default async function RootLayout({
  children,
  dialog,
  drawer,
}: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  initializePageLocale(locale);

  const { language } = getLocaleInfo(locale);
  const preloadLanguage = language === "ar" ? "ar" : "en";
  const direction = getLangDir(locale);

  // Generate Organization schema for SEO (appears on all pages)
  const organizationSchema = generateOrganizationSchema(locale as Locale);

  return (
    <html
      data-locale={language}
      dir={direction}
      lang={language}
      suppressHydrationWarning
    >
      <body className="bg-bg-body antialiased">
        {/* <LocaleFontPreload language={preloadLanguage} /> */}
        <NewRelicBrowserAgent />
        {/* Organization Schema - appears on every page */}
        <JsonLdScript data={organizationSchema} id="organization-schema" />
        <SpinnerAssetsPreloader />

        <AppRootProvider locale={locale as Locale}>
          {children}
          {dialog}
          {drawer}
        </AppRootProvider>
        <Toaster
          expand
          mobileOffset={{
            bottom: "40px",
            top: "40px",
          }}
          offset={{
            bottom: "40px",
            top: "40px",
          }}
          position="top-center"
          style={
            {
              "--width": "390px",
            } as CSSProperties
          }
        />
      </body>
    </html>
  );
}
