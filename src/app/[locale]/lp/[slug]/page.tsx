import type { Metadata } from "next";

import { LpTracker } from "@/components/analytics/lp-tracker";
import { BannerSliderSection } from "@/components/banner/banner-slider-section";
import { WebsiteBannerComponent } from "@/components/banner/website-banner";
import WebsiteMultipleBannersComponent from "@/components/banner/website-multiple-banners";
import HomeCategories from "@/components/category/home-categories";
import SeoContentBlockComponent from "@/components/content/seo-content-block";
import { RedirectToHome } from "@/components/navigation/redirect-to-home";
import { CategoryProductsCarousel } from "@/components/product/category-products-carousel";
import { FlashSaleSection } from "@/components/product/flash-sale-section";
import { RecentlyViewedProducts } from "@/components/product/recently-viewed-products";
import { TopTrendsSection } from "@/components/product/top-trends-section";
import Container from "@/components/shared/container";
import { MobileTopBarTitleSync } from "@/components/shared/mobile-top-bar-title-sync";
import { getPageLandingData } from "@/lib/actions/contentful/page-landing";
import { INFO_PAGE_SLUGS } from "@/lib/constants/pages";
import { ROUTE_PLACEHOLDER } from "@/lib/constants/routes";
import { BannerSlider } from "@/lib/models/banner-slider";
import { CategoryProducts } from "@/lib/models/category-products";
import { DesktopCategories } from "@/lib/models/desktop-categories";
import { FlashSale } from "@/lib/models/flash-sale";
import { TabContentType } from "@/lib/models/page-landing";
import { RecentlyViewedProductsContent } from "@/lib/models/recently-viewed-products-content";
import { SeoContentBlock } from "@/lib/models/seo-content-block";
import { TopTrendsCategoryProducts } from "@/lib/models/top-trends-category-products";
import { WebsiteBanner } from "@/lib/models/website-banner";
import { WebsiteMultipleBanners } from "@/lib/models/website-multiple-banners";
import { cn } from "@/lib/utils";
import { initializePageLocale } from "@/lib/utils/locale";
import {
  generateAbsoluteCanonicalUrl,
  generateHreflangTags,
} from "@/lib/utils/seo";

import type { Locale } from "@/lib/constants/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/lp/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;

  if (slug === ROUTE_PLACEHOLDER || INFO_PAGE_SLUGS.includes(slug)) {
    return {
      title: "Landing Page",
    };
  }

  const pageLandingData = await getPageLandingData({
    locale,
    slug,
  });
  if (!pageLandingData?.contents) {
    return {
      title: "Landing Page",
    };
  }

  const seo = pageLandingData.seo;
  const defaultCanonicalUrl = generateAbsoluteCanonicalUrl({
    locale: locale as Locale,
    pathname: `/lp/${slug}`,
  });
  const canonicalUrl =
    (seo?.canonicalUrl && seo.canonicalUrl.trim() !== ""
      ? seo.canonicalUrl
      : undefined) ?? defaultCanonicalUrl;

  const hreflangs = generateHreflangTags({
    globalPathname: `/lp/${slug}`,
    pathname: `/lp/${slug}`,
  });

  const title = seo?.pageTitle?.trim() || pageLandingData.internalName || slug;
  const description = seo?.pageDescription?.trim() || undefined;

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
            url: `${defaultCanonicalUrl}/logo-512x512.png`,
            width: 1200,
          },
        ];

  return {
    alternates: {
      canonical: canonicalUrl,
      languages: hreflangs,
    },
    description,
    openGraph: {
      description,
      images: shareImages,
      locale: locale,
      siteName: "Golden Scent",
      title,
      type: "website",
      url: canonicalUrl,
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

export async function generateStaticParams({
  params,
}: {
  params: Awaited<LayoutProps<"/[locale]">["params"]>;
}) {
  const discoveredSlugs = new Set<string>([ROUTE_PLACEHOLDER]);
  const { locale } = params;
  const pageLandingData = await getPageLandingData({
    locale,
  });

  for (const slug of collectLpSlugsFromHomeContent(pageLandingData)) {
    discoveredSlugs.add(slug);
  }

  return Array.from(discoveredSlugs).map((slug) => ({ slug }));
}

export default async function LandingPage({
  params,
}: PageProps<"/[locale]/lp/[slug]">) {
  const { locale, slug } = await params;
  initializePageLocale(locale);

  if (slug === ROUTE_PLACEHOLDER || INFO_PAGE_SLUGS.includes(slug)) {
    return <RedirectToHome />;
  }

  const pageLandingData = await getPageLandingData({
    locale,
    slug,
  });

  if (!pageLandingData?.contents) {
    return <RedirectToHome />;
  }

  return (
    <>
      {pageLandingData.mobileHeaderTitle ? (
        <MobileTopBarTitleSync title={pageLandingData.mobileHeaderTitle} />
      ) : null}
      <LpTracker
        lp={{
          lp_id: slug,
          lp_name: pageLandingData.internalName || slug,
          type: "webview",
        }}
      />
      {pageLandingData.contents?.map((content, index) => {
        switch (content.contentType) {
          case TabContentType.BannerSlider:
            const bannerSlider = content as BannerSlider;
            return (
              <Container className="mt-2" key={`content-${index}`}>
                <BannerSliderSection
                  bannerColumn={1}
                  bannerContainerProps={{
                    className:
                      "rounded-2xl mt-2 h-[var(--mobile-height)] lg:h-[var(--desktop-height)] overflow-hidden",
                    style: {
                      "--desktop-height": `${bannerSlider.sliderHeight?.desktop}px`,
                      "--mobile-height": `${bannerSlider.sliderHeight?.mobile}px`,
                    } as React.CSSProperties,
                  }}
                  bannerLpId={slug}
                  bannerOrigin="lp"
                  bannerRow={index + 1}
                  banners={structuredClone(bannerSlider.items)}
                  carouselContainerProps={{
                    carouselProps: {
                      autoPlay: {
                        delay: bannerSlider.autoSliding?.delay,
                        enabled: bannerSlider.autoSliding?.enabled,
                      },
                    },
                  }}
                  isLcpCandidate={bannerSlider.isLcpCandidate}
                />
              </Container>
            );
          case TabContentType.CategoryProducts:
            const categoryProducts = content as CategoryProducts;
            return (
              <Container
                className={cn(
                  "lg:mt-7.5 mt-5",
                  "[contain-intrinsic-size:0_540px] [content-visibility:auto] lg:[content-visibility:visible]"
                )}
                key={`content-${index}`}
              >
                <CategoryProductsCarousel
                  {...categoryProducts}
                  lpRow={index + 1}
                />
              </Container>
            );
          case TabContentType.DesktopCategories:
            return (
              <div className="hidden lg:block" key={`content-${index}`}>
                <Container>
                  <HomeCategories
                    data={content as DesktopCategories}
                    lpRow={index + 1}
                  />
                </Container>
              </div>
            );
          case TabContentType.FlashSale:
            return (
              <Container
                className="[contain-intrinsic-size:0_640px] [content-visibility:auto] lg:[content-visibility:visible]"
                key={`content-${index}`}
              >
                <FlashSaleSection {...(content as FlashSale)} />
              </Container>
            );
          case TabContentType.RecentlyViewedProducts:
            return (
              <Container
                className={cn(
                  "lg:mt-7.5 mt-5",
                  "[contain-intrinsic-size:0_540px] [content-visibility:auto] lg:[content-visibility:visible]"
                )}
                key={`content-${index}`}
              >
                <RecentlyViewedProducts
                  data={content as RecentlyViewedProductsContent}
                  lpRow={index + 1}
                />
              </Container>
            );
          case TabContentType.SeoContentBlock:
            const seoContentBlock = content as SeoContentBlock;
            return (
              <Container className="lg:mt-7.5 mt-5" key={`content-${index}`}>
                <SeoContentBlockComponent data={seoContentBlock} />
              </Container>
            );
          case TabContentType.TopTrendsCategoryProducts:
            return (
              <Container
                className={cn(
                  "lg:mt-7.5 mt-5",
                  "[contain-intrinsic-size:0_820px] [content-visibility:auto]"
                )}
                key={`content-${index}`}
              >
                <TopTrendsSection
                  bannerColumn={1}
                  bannerLpId={slug}
                  bannerOrigin="lp"
                  bannerRow={index + 1}
                  lpRow={index + 1}
                  {...(content as TopTrendsCategoryProducts)}
                />
              </Container>
            );
          case TabContentType.WebsiteBanner:
            return (
              <Container key={`content-${index}`}>
                <WebsiteBannerComponent
                  banner={content as WebsiteBanner}
                  bannerColumn={1}
                  bannerLpId={slug}
                  bannerOrigin="lp"
                  bannerRow={index + 1}
                  isLcpCandidate={(content as WebsiteBanner).isLcpCandidate}
                />
              </Container>
            );
          case TabContentType.WebsiteMultipleBanner:
            return (
              <Container className="mt-2.5" key={`content-${index}`}>
                <WebsiteMultipleBannersComponent
                  bannerLpId={slug}
                  bannerOrigin="lp"
                  bannerRow={index + 1}
                  data={content as WebsiteMultipleBanners}
                />
              </Container>
            );
        }
      })}
    </>
  );
}

function collectLpSlugsFromHomeContent(
  pageLandingData: Awaited<ReturnType<typeof getPageLandingData>>
) {
  const slugs = new Set<string>();
  const addSlug = (url?: string) => {
    const slug = extractLpSlugFromUrl(url);
    if (slug) {
      slugs.add(slug);
    }
  };

  for (const content of pageLandingData?.contents || []) {
    switch (content.contentType) {
      case TabContentType.BannerSlider:
        for (const banner of (content as BannerSlider).items) {
          addSlug(banner.btnUrl);
        }
        break;
      case TabContentType.DesktopCategories:
        for (const category of (content as DesktopCategories).categories) {
          addSlug(category.url);
        }
        break;
      case TabContentType.TopTrendsCategoryProducts:
        const topTrendsContent = content as TopTrendsCategoryProducts;
        addSlug(topTrendsContent.cashbackButtonUrl);
        addSlug(topTrendsContent.cashbackCurrencyImage?.redirectUrl);
        for (const image of topTrendsContent.bannerImages || []) {
          addSlug(image.redirectUrl);
        }
        break;
      case TabContentType.WebsiteBanner:
        addSlug((content as WebsiteBanner).url);
        break;
      case TabContentType.WebsiteMultipleBanner:
        for (const banner of (content as WebsiteMultipleBanners).banners) {
          addSlug(banner.url);
        }
        break;
    }
  }

  addSlug(pageLandingData?.promoBanner?.url);

  collectNavigationLpSlugs(pageLandingData?.siteNavigation?.items, addSlug);

  return slugs;
}

function collectNavigationLpSlugs(
  items:
    | {
        path: string;
        subMenu?: {
          path: string;
          subMenu?: {
            path: string;
          }[];
        }[];
      }[]
    | undefined,
  addSlug: (url?: string) => void
) {
  if (!items?.length) return;

  for (const item of items) {
    addSlug(item.path);
    collectNavigationLpSlugs(item.subMenu, addSlug);
  }
}

function extractLpSlugFromUrl(url?: string) {
  if (!url?.trim()) return null;

  let pathname = url.trim();
  try {
    pathname = new URL(pathname, "https://goldenscent.com").pathname;
  } catch {
    return null;
  }

  const segments = pathname
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
  const lpSegmentIndex = segments.findIndex(
    (segment) => segment.toLowerCase() === "lp"
  );

  if (lpSegmentIndex === -1) return null;

  const slug = segments[lpSegmentIndex + 1];
  if (!slug) return null;

  const normalizedSlug = decodeURIComponent(slug).trim();
  if (
    !normalizedSlug ||
    normalizedSlug === ROUTE_PLACEHOLDER ||
    INFO_PAGE_SLUGS.includes(normalizedSlug)
  ) {
    return null;
  }

  return normalizedSlug;
}
