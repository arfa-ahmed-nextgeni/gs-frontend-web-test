import { BannerSlider } from "@/lib/models/banner-slider";
import { CategoryProducts } from "@/lib/models/category-products";
import {
  type ComponentSeo,
  parseComponentSeo,
} from "@/lib/models/component-seo";
import { CookieConsentPromptModel } from "@/lib/models/cookie-consent-prompt-model";
import { DesktopCategories } from "@/lib/models/desktop-categories";
import { FlashSale } from "@/lib/models/flash-sale";
import { OpenAppPromptModel } from "@/lib/models/open-app-prompt-model";
import { PromoBanner } from "@/lib/models/promo-banner";
import { RecentlyViewedProductsContent } from "@/lib/models/recently-viewed-products-content";
import { SeoContentBlock } from "@/lib/models/seo-content-block";
import { SiteNavigation } from "@/lib/models/site-navigation";
import { TitleAndDescription } from "@/lib/models/title-and-description";
import { TopTrendsCategoryProducts } from "@/lib/models/top-trends-category-products";
import { WebsiteBanner } from "@/lib/models/website-banner";
import { WebsiteFooter } from "@/lib/models/website-footer";
import { WebsiteMultipleBanners } from "@/lib/models/website-multiple-banners";
import { YoutubeVideo } from "@/lib/models/youtube-video";
import {
  NavHeaderData,
  PromoBannerData,
} from "@/lib/types/contentful/nav-header";
import {
  BannerSliderData,
  CategoryProductsData,
  CookieConsentPromptData,
  DesktopCategoriesData,
  FlashSaleData,
  OpenAppPromptData,
  PageLandingData,
  RecentlyViewedProductsData,
  SeoContentBlockData,
  TitleAndDescriptionData,
  TopTrendsData,
  WebsiteBannerData,
  WebsiteFooterData,
  WebsiteMultipleBannersData,
  YoutubeVideoData,
} from "@/lib/types/contentful/page-landing";

export const enum TabContentType {
  BannerSlider = "bannerSlider",
  CategoryProducts = "categoryProducts",
  CookieConsentPrompt = "cookieConsentPrompt",
  DesktopCategories = "desktopCategories",
  FlashSale = "flashSale",
  Footer = "desktopFooter",
  Navigation = "desktopNavigation",
  OpenAppPrompt = "openAppPrompt",
  PromoBanner = "websitePromotionalBanner",
  RecentlyViewedProducts = "recentlyViewProduct",
  SeoContentBlock = "seoContentBlock",
  TitleAndDescription = "titleAndDescription",
  TopTrendsCategoryProducts = "topTrends",
  WebsiteBanner = "websiteBanner",
  WebsiteFooter = "websiteFooter",
  WebsiteMultipleBanner = "websiteMultipleBanners",
  YoutubeVideo = "youtubeVideo",
}

export class PageLanding {
  public contents?: (
    | BannerSlider
    | CategoryProducts
    | DesktopCategories
    | FlashSale
    | RecentlyViewedProductsContent
    | SeoContentBlock
    | TitleAndDescription
    | TopTrendsCategoryProducts
    | WebsiteBanner
    | WebsiteMultipleBanners
    | YoutubeVideo
  )[];
  public cookieConsentPrompt?: CookieConsentPromptModel;
  public homeBanner?: WebsiteBanner;
  public internalName?: string;
  public mobileHeaderTitle?: string;
  public openAppPrompt?: OpenAppPromptModel;
  public promoBanner?: PromoBanner;
  public seo?: ComponentSeo;
  public siteNavigation?: SiteNavigation;
  public websiteFooter?: WebsiteFooter;

  constructor(data: PageLandingData) {
    this.internalName = data.items?.[0]?.fields?.internalName;
    this.mobileHeaderTitle = data.items?.[0]?.fields?.mobileHeaderTitle;
    const fields = data.items?.[0]?.fields;
    const resolvedSeo = parseComponentSeo(fields?.seo);
    if (resolvedSeo) {
      this.seo = resolvedSeo;
    }
    const tabContents = fields?.tabContent;

    const webFooterData = tabContents?.find(
      (content) =>
        content.sys.contentType?.sys.id === TabContentType.WebsiteFooter
    );

    if (webFooterData?.fields && webFooterData.sys.contentType) {
      this.websiteFooter = new WebsiteFooter(
        webFooterData.fields as WebsiteFooterData
      );
    }

    const promoBannerData = tabContents?.find(
      (content) =>
        content.sys.contentType?.sys.id === TabContentType.PromoBanner
    );

    if (promoBannerData?.fields) {
      this.promoBanner = new PromoBanner(
        promoBannerData.fields as PromoBannerData
      );
    }

    const siteNavigationData = tabContents?.find(
      (content) => content.sys.contentType?.sys.id === TabContentType.Navigation
    );

    if (siteNavigationData?.fields) {
      this.siteNavigation = new SiteNavigation(
        siteNavigationData.fields as NavHeaderData
      );
    }

    const homeBannerData = tabContents?.find(
      (content) =>
        content.sys.contentType?.sys.id === TabContentType.WebsiteBanner
    );

    if (homeBannerData?.fields && homeBannerData.sys.contentType) {
      this.homeBanner = new WebsiteBanner(
        homeBannerData.fields as WebsiteBannerData,
        homeBannerData.sys.contentType.sys.id
      );
    }

    const openAppPromptData = tabContents?.find(
      (content) =>
        content.sys.contentType?.sys.id === TabContentType.OpenAppPrompt
    );

    if (openAppPromptData?.fields && openAppPromptData.sys.contentType) {
      this.openAppPrompt = new OpenAppPromptModel(
        openAppPromptData.fields as OpenAppPromptData,
        openAppPromptData.sys.contentType.sys.id
      );
    }

    const cookieConsentPromptData = tabContents?.find(
      (content) =>
        content.sys.contentType?.sys.id === TabContentType.CookieConsentPrompt
    );

    if (
      cookieConsentPromptData?.fields &&
      cookieConsentPromptData.sys.contentType
    ) {
      this.cookieConsentPrompt = new CookieConsentPromptModel(
        cookieConsentPromptData.fields as CookieConsentPromptData,
        cookieConsentPromptData.sys.contentType.sys.id
      );
    }

    this.contents = tabContents
      ?.filter((content) =>
        [
          TabContentType.BannerSlider,
          TabContentType.CategoryProducts,
          TabContentType.DesktopCategories,
          TabContentType.FlashSale,
          TabContentType.PromoBanner,
          TabContentType.RecentlyViewedProducts,
          TabContentType.SeoContentBlock,
          TabContentType.TitleAndDescription,
          TabContentType.TopTrendsCategoryProducts,
          TabContentType.WebsiteBanner,
          TabContentType.WebsiteMultipleBanner,
          TabContentType.YoutubeVideo,
        ].includes(content.sys.contentType?.sys.id as TabContentType)
      )
      .map((filteredContent) => {
        switch (filteredContent.sys.contentType?.sys.id) {
          case TabContentType.BannerSlider:
            return new BannerSlider(
              filteredContent.fields as BannerSliderData,
              filteredContent.sys.contentType.sys.id
            );
          case TabContentType.CategoryProducts:
            return new CategoryProducts(
              filteredContent.fields as CategoryProductsData,
              filteredContent.sys.contentType.sys.id
            );

          case TabContentType.DesktopCategories:
            return new DesktopCategories(
              filteredContent.fields as DesktopCategoriesData,
              filteredContent.sys.contentType.sys.id
            );
          case TabContentType.FlashSale:
            return new FlashSale(
              filteredContent.fields as FlashSaleData,
              TabContentType.FlashSale
            );
          case TabContentType.RecentlyViewedProducts:
            return new RecentlyViewedProductsContent(
              filteredContent.fields as RecentlyViewedProductsData,
              TabContentType.RecentlyViewedProducts
            );
          case TabContentType.SeoContentBlock:
            return new SeoContentBlock(
              filteredContent.fields as SeoContentBlockData,
              filteredContent.sys.contentType.sys.id
            );
          case TabContentType.TitleAndDescription:
            return new TitleAndDescription(
              filteredContent.fields as TitleAndDescriptionData,
              filteredContent.sys.contentType.sys.id
            );
          case TabContentType.TopTrendsCategoryProducts:
            return new TopTrendsCategoryProducts(
              filteredContent.fields as TopTrendsData,
              TabContentType.TopTrendsCategoryProducts
            );
          case TabContentType.WebsiteBanner:
            return new WebsiteBanner(
              filteredContent.fields as WebsiteBannerData,
              filteredContent.sys.contentType.sys.id
            );
          case TabContentType.WebsiteMultipleBanner:
            return new WebsiteMultipleBanners(
              filteredContent.fields as unknown as WebsiteMultipleBannersData,
              TabContentType.WebsiteMultipleBanner
            );
          case TabContentType.YoutubeVideo:
            return new YoutubeVideo(
              filteredContent.fields as YoutubeVideoData,
              filteredContent.sys.contentType.sys.id
            );
        }
      })
      .filter((item) => !!item);
  }
}
