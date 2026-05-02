import { Suspense } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getTranslations } from "next-intl/server";

import { BannerSliderSection } from "@/components/banner/banner-slider-section";
import { WebsiteBannerComponent } from "@/components/banner/website-banner";
import WebsiteMultipleBannersComponent from "@/components/banner/website-multiple-banners";
import HomeCategories from "@/components/category/home-categories";
import ContactForm from "@/components/content/contact-form";
import TitleAndDescription from "@/components/content/title-and-description";
import TrackOrder from "@/components/content/track-order";
import YoutubeVideo from "@/components/content/youtube-video";
import { CategoryProductsCarousel } from "@/components/product/category-products-carousel";
import { FlashSaleSection } from "@/components/product/flash-sale-section";
import { TopTrendsSection } from "@/components/product/top-trends-section";
import Container from "@/components/shared/container";
import { MobileTopBarTitleSync } from "@/components/shared/mobile-top-bar-title-sync";
import { Link } from "@/i18n/navigation";
import { getPageLandingData } from "@/lib/actions/contentful/page-landing";
import { INFO_PAGE_SLUGS, INFO_PAGES } from "@/lib/constants/pages";
import { BannerSlider } from "@/lib/models/banner-slider";
import { CategoryProducts } from "@/lib/models/category-products";
import { DesktopCategories } from "@/lib/models/desktop-categories";
import { FlashSale } from "@/lib/models/flash-sale";
import { TabContentType } from "@/lib/models/page-landing";
import { TitleAndDescription as TitleAndDescriptionModel } from "@/lib/models/title-and-description";
import { TopTrendsCategoryProducts } from "@/lib/models/top-trends-category-products";
import { WebsiteBanner } from "@/lib/models/website-banner";
import { WebsiteMultipleBanners } from "@/lib/models/website-multiple-banners";
import { YoutubeVideo as YoutubeVideoModel } from "@/lib/models/youtube-video";
import { initializePageLocale } from "@/lib/utils/locale";
import {
  generateAbsoluteCanonicalUrl,
  generateHreflangTags,
} from "@/lib/utils/seo";

import type { Locale } from "@/lib/constants/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!INFO_PAGE_SLUGS.includes(slug)) {
    return {
      title: "Page Not Found",
    };
  }

  const t = await getTranslations("StaticPages");

  const pageLandingData = await getPageLandingData({
    locale,
    slug,
  });

  const seo = pageLandingData?.seo;
  const defaultCanonicalUrl = generateAbsoluteCanonicalUrl({
    locale: locale as Locale,
    pathname: `/${slug}`,
  });
  const canonicalUrl =
    (seo?.canonicalUrl && seo.canonicalUrl.trim() !== ""
      ? seo.canonicalUrl
      : undefined) ?? defaultCanonicalUrl;

  // Generate hreflang tags for static/info page
  // Static pages typically exist across all stores
  const hreflangs = generateHreflangTags({
    pathname: `/${slug}`,
  });

  const pageInfo = INFO_PAGES.find((page) => page.slug === slug);
  const defaultTitle = pageInfo ? t(pageInfo.translationKey as any) : slug;
  const title = seo?.pageTitle?.trim() || defaultTitle;
  const defaultDescription = (pageLandingData as any)?.metaDescription;
  const description =
    seo?.pageDescription?.trim() || defaultDescription || undefined;

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

export function generateStaticParams() {
  return INFO_PAGE_SLUGS.map((slug) => ({ slug }));
}

export default async function StaticPage({
  params,
}: PageProps<"/[locale]/[slug]">) {
  const { locale, slug } = await params;
  initializePageLocale(locale);

  if (!INFO_PAGE_SLUGS.includes(slug)) {
    notFound();
  }

  const t = await getTranslations("StaticPages");

  const pageLandingData = await getPageLandingData({
    locale,
    slug,
  });

  return (
    <>
      {pageLandingData.mobileHeaderTitle ? (
        <MobileTopBarTitleSync title={pageLandingData.mobileHeaderTitle} />
      ) : null}
      <Container className="">
        <div className="flex flex-col lg:flex-row">
          <aside className="hidden w-full flex-shrink-0 lg:block lg:w-64">
            <div className="bg-white p-4 pt-10">
              <nav>
                {INFO_PAGES.map((page) => (
                  <Link
                    className={`block rounded-md px-4 py-2 text-sm transition-colors ${
                      slug === page.slug
                        ? "bg-primary text-black no-underline"
                        : "text-gray-700 underline hover:bg-gray-100"
                    }`}
                    href={`/${page.slug}`}
                    key={page.slug}
                  >
                    {t(page.translationKey as any)}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          <main className="flex-1">
            {pageLandingData.contents?.map((content, index) => {
              switch (content.contentType) {
                case TabContentType.BannerSlider:
                  const bannerSlider = content as BannerSlider;
                  return (
                    <div key={`content-${index}`}>
                      <BannerSliderSection
                        bannerColumn={1}
                        bannerContainerProps={{
                          className:
                            "rounded-2xl h-[var(--mobile-height)] lg:h-[var(--desktop-height)] overflow-hidden",
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
                    </div>
                  );
                case TabContentType.CategoryProducts:
                  const categoryProducts = content as CategoryProducts;
                  return (
                    <div key={`content-${index}`}>
                      <CategoryProductsCarousel
                        {...categoryProducts}
                        lpRow={index + 1}
                      />
                    </div>
                  );

                case TabContentType.DesktopCategories:
                  return (
                    <div className="hidden lg:block" key={`content-${index}`}>
                      <HomeCategories
                        data={content as DesktopCategories}
                        lpRow={index + 1}
                      />
                    </div>
                  );
                case TabContentType.FlashSale:
                  return (
                    <div key={`content-${index}`}>
                      <FlashSaleSection {...(content as FlashSale)} />
                    </div>
                  );
                case TabContentType.TitleAndDescription:
                  const titleAndDescription =
                    content as TitleAndDescriptionModel;
                  return (
                    <div key={`content-${index}`}>
                      <TitleAndDescription
                        data={{
                          contentType: titleAndDescription.contentType,
                          description: titleAndDescription.description,
                          internalName: titleAndDescription.internalName,
                          title: titleAndDescription.title,
                        }}
                      />
                    </div>
                  );
                case TabContentType.TopTrendsCategoryProducts:
                  return (
                    <div key={`content-${index}`}>
                      <TopTrendsSection
                        bannerColumn={1}
                        bannerLpId={slug}
                        bannerOrigin="lp"
                        bannerRow={index + 1}
                        lpRow={index + 1}
                        {...(content as TopTrendsCategoryProducts)}
                      />
                    </div>
                  );
                case TabContentType.WebsiteBanner:
                  return (
                    <div key={`content-${index}`}>
                      <WebsiteBannerComponent
                        banner={content as WebsiteBanner}
                        bannerColumn={1}
                        bannerLpId={slug}
                        bannerOrigin="lp"
                        bannerRow={index + 1}
                        isLcpCandidate={
                          (content as WebsiteBanner).isLcpCandidate
                        }
                      />
                    </div>
                  );
                case TabContentType.WebsiteMultipleBanner:
                  return (
                    <div key={`content-${index}`}>
                      <WebsiteMultipleBannersComponent
                        bannerLpId={slug}
                        bannerOrigin="lp"
                        bannerRow={index + 1}
                        data={content as WebsiteMultipleBanners}
                      />
                    </div>
                  );
                case TabContentType.YoutubeVideo:
                  const youtubeVideo = content as YoutubeVideoModel;
                  return (
                    <div key={`content-${index}`}>
                      <YoutubeVideo
                        data={{
                          contentType: youtubeVideo.contentType,
                          internalName: youtubeVideo.internalName,
                          videoUrl: youtubeVideo.videoUrl,
                        }}
                      />
                    </div>
                  );
              }
            })}

            {slug === "account-delete-policy" && (
              <div>
                <ContactForm />
              </div>
            )}

            {slug === "track-order" && (
              <div>
                <Suspense>
                  <TrackOrder />
                </Suspense>
              </div>
            )}
          </main>
        </div>
      </Container>
    </>
  );
}
