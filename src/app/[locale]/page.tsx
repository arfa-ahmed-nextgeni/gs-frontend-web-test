import { HomeTracker } from "@/components/analytics/home-tracker";
import { BannerSliderSection } from "@/components/banner/banner-slider-section";
import { WebsiteBannerComponent } from "@/components/banner/website-banner";
import WebsiteMultipleBannersComponent from "@/components/banner/website-multiple-banners";
import HomeCategories from "@/components/category/home-categories";
import SeoContentBlockComponent from "@/components/content/seo-content-block";
import { CategoryProductsCarousel } from "@/components/product/category-products-carousel";
import { FlashSaleSection } from "@/components/product/flash-sale-section";
import { RecentlyViewedProducts } from "@/components/product/recently-viewed-products";
import { TopTrendsSection } from "@/components/product/top-trends-section";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import Container from "@/components/shared/container";
import { getPageLandingData } from "@/lib/actions/contentful/page-landing";
import { Locale } from "@/lib/constants/i18n";
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
import { generateWebsiteSchema } from "@/lib/utils/schema";

const BANNER_LCP_CANDIDATE_INDEX = 0;

export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  initializePageLocale(locale);

  const pageLandingData = await getPageLandingData({
    locale,
  });

  if (!pageLandingData?.contents) {
    return null;
  }

  // Generate WebSite schema for homepage
  const websiteSchema = generateWebsiteSchema(locale as Locale);

  return (
    <>
      {/* WebSite Schema - enables site search box in Google */}
      <JsonLdScript data={websiteSchema} id="website-schema" />

      <HomeTracker />
      {/* SEO: Hidden h1 for homepage only - this should NOT appear on other pages */}
      <h1 className="sr-only">Golden Scent</h1>
      {pageLandingData.contents?.map((content, index) => {
        switch (content.contentType) {
          case TabContentType.BannerSlider:
            const bannerSlider = content as BannerSlider;
            return (
              <Container className="mt-4" key={`content-${index}`}>
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
                  bannerLpId="home"
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
                  isLcpCandidate={index === BANNER_LCP_CANDIDATE_INDEX}
                />
              </Container>
            );
          case TabContentType.CategoryProducts:
            const categoryProducts = content as CategoryProducts;
            if (categoryProducts.title === "FBT") return null;
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
              <Container className="hidden lg:block" key={`content-${index}`}>
                <HomeCategories
                  data={content as DesktopCategories}
                  lpRow={index + 1}
                />
              </Container>
            );
          case TabContentType.FlashSale:
            return (
              <Container
                className="[contain-intrinsic-size:0_640px] [content-visibility:auto] lg:[content-visibility:visible]"
                key={`content-${index}`}
              >
                <FlashSaleSection
                  {...(content as FlashSale)}
                  lpRow={index + 1}
                />
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
            return (
              <Container className="lg:mt-7.5 mt-5" key={`content-${index}`}>
                <SeoContentBlockComponent data={content as SeoContentBlock} />
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
                  bannerLpId="home"
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
                  bannerLpId="home"
                  bannerOrigin="lp"
                  bannerRow={index + 1}
                  isLcpCandidate={index === BANNER_LCP_CANDIDATE_INDEX}
                />
              </Container>
            );
          case TabContentType.WebsiteMultipleBanner:
            return (
              <Container className="mt-2.5" key={`content-${index}`}>
                <WebsiteMultipleBannersComponent
                  bannerLpId="home"
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
