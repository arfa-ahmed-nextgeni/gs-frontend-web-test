import { HomeTracker } from "@/components/analytics/home-tracker";
import { BannerSliderCarousel } from "@/components/banner/banner-slider-carousel";
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
import { initializePageLocale } from "@/lib/utils/locale";
import { generateWebsiteSchema } from "@/lib/utils/schema";

const DEFERRED_CATEGORY_PRODUCTS_DELAY_MS = 500;

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
  let deferredProductSectionIndex = 0;

  const getDeferredProductSectionDelayMs = () => {
    const delayMs =
      deferredProductSectionIndex === 0
        ? undefined
        : DEFERRED_CATEGORY_PRODUCTS_DELAY_MS;

    deferredProductSectionIndex += 1;

    return delayMs;
  };

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
              <Container className="mt-2" key={`content-${index}`}>
                <BannerSliderCarousel
                  bannerColumn={1}
                  bannerContainerProps={{
                    className:
                      "rounded-2xl mt-2 h-[var(--mobile-height)] lg:h-[var(--desktop-height)] overflow-hidden",
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
                />
              </Container>
            );
          case TabContentType.CategoryProducts:
            const categoryProducts = content as CategoryProducts;
            if (categoryProducts.title === "FBT") return null;
            return (
              <Container className="lg:mt-7.5 mt-5" key={`content-${index}`}>
                <CategoryProductsCarousel
                  {...categoryProducts}
                  delayMs={getDeferredProductSectionDelayMs()}
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
              <Container key={`content-${index}`}>
                <FlashSaleSection
                  {...(content as FlashSale)}
                  delayMs={getDeferredProductSectionDelayMs()}
                  lpRow={index + 1}
                />
              </Container>
            );
          case TabContentType.RecentlyViewedProducts:
            return (
              <RecentlyViewedProducts
                data={content as RecentlyViewedProductsContent}
                key={`content-${index}`}
                lpRow={index + 1}
              />
            );
          case TabContentType.SeoContentBlock:
            return (
              <Container className="lg:mt-7.5 mt-5" key={`content-${index}`}>
                <SeoContentBlockComponent data={content as SeoContentBlock} />
              </Container>
            );
          case TabContentType.TopTrendsCategoryProducts:
            return (
              <Container className="lg:mt-7.5 mt-5" key={`content-${index}`}>
                <TopTrendsSection
                  bannerColumn={1}
                  bannerLpId="home"
                  bannerOrigin="lp"
                  bannerRow={index + 1}
                  delayMs={getDeferredProductSectionDelayMs()}
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
