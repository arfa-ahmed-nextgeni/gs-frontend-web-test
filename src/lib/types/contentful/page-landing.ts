import { Document } from "@contentful/rich-text-types";

import { WishlistState } from "@/lib/constants/product/product-card";
import { TabContentType } from "@/lib/models/page-landing";
import {
  WebsiteFooterContactAndSocialLinks,
  WebsiteFooterLinks,
  WebsiteFooterPromoAndFeatures,
} from "@/lib/models/website-footer";
import {
  NavHeaderData,
  PromoBannerData,
} from "@/lib/types/contentful/nav-header";

export type BannerSliderData = {
  autoSliding?: boolean;
  autoSlidingDelay?: number;
  banners: {
    fields: {
      elementId?: string;
      image: {
        fields: {
          file: {
            contentType: string;
            details: {
              image: {
                height: number;
                width: number;
              };
              size: string;
            };
            fileName: string;
            url: string;
          };
        };
        sys: {
          id: string;
        };
      };
      url: string;
    };
    sys: {
      id: string;
    };
  }[];
  desktopSliderHeight: number;
  internalName: string;
  sliderHeight: number;
  sliding: boolean;
  snapping: boolean;
  title: string;
};

export type CartSuggestedProductsData = {
  emptyCartFallbackCategoryId?: string;
  emptyCartFallbackRichTitle?: Document;
  emptyCartFallbackTitle?: string;
  enabled?: boolean;
  internalName: string;
  maximumProducts: number;
  richTitle?: Document;
  suggestedProductsCategoryId: string;
  title: string;
};

export type CategoryProductsData = {
  bundlesVariant?: boolean;
  grid?: boolean;
  maximumProducts: number;
  productsCategoryId?: string;
  richTitle?: Document;
  showClearHistory?: boolean;
  showViewAll: boolean;
  title: string;
};

/** Component - SEO (componentSeo) content type from Contentful */
export type ComponentSeoData = {
  canonicalUrl?: string;
  internalName?: string;
  nofollow?: boolean;
  noindex?: boolean;
  pageDescription?: string;
  pageTitle?: string;
  shareImages?: ContentfulAssetData[];
};

/** Asset reference as returned by Contentful when resolved (e.g. shareImages) */
export type ContentfulAssetData = {
  fields?: {
    file?: {
      details?: { image?: { height: number; width: number } };
      url: string;
    };
    title?: string;
  };
  sys?: { id: string };
};

export type ContentfulImageData = {
  elementId?: string;
  image: {
    fields: {
      file: {
        contentType: string;
        details: {
          image: {
            height: number;
            width: number;
          };
          size: string;
        };
        fileName: string;
        url: string;
      };
      title: string;
    };
  };
  label: string;
  url: string;
};

export type ContentfulProductData = {
  badges?: {
    type: string;
  }[];
  currency: string;
  description: string;
  discountPercent?: number;
  id: string;
  imageUrl: string;
  name: string;
  oldPrice?: number;
  options?: {
    choices: {
      inStock: boolean;
      label: string;
      value: string;
    }[];
    type: string;
  };
  price: number;
  ratingSummary: number;
  savedAmount: number;
  savedCurrency: string;
  stockStatus: string;
  wishlistState: WishlistState;
};

export type CookieConsentPromptData = {
  allowButtonLabel: string;
  consentVersion: string;
  declineButtonLabel: string;
  description: Document;
  enabled?: boolean;
  internalName: string;
};

export type DesktopCategoriesData = {
  categories: {
    fields: ContentfulImageData;
    sys: {
      id: string;
    };
  }[];
  title?: string;
};

export type FlashSaleData = {
  autoSlideDelay?: number;
  autoSliding?: boolean;
  endTime?: string;
  endTimezone?: string;
  maximumProducts?: number;
  productsCategoryId?: string;
  saleIcon?: {
    fields: {
      file: {
        details: {
          image: {
            height: number;
            width: number;
          };
        };
        url: string;
      };
    };
  };
  saleUrl?: string;
  showViewAll?: boolean;
  startTime?: string;
  startTimezone?: string;
  subtitle?: string;
  title?: string;
};

export type OpenAppPromptData = {
  appRating: number;
  appStoreUrl: string;
  dismissButtonLabel: string;
  openAppButtonLabel: string;
  playStoreUrl: string;
  subtitle: string;
  title: string;
};

export type PageLandingData = {
  items?: [
    {
      fields?: {
        countryCode: string;
        internalName: string;
        mobileHeaderTitle?: string;
        seo?: {
          fields?: ComponentSeoData;
          sys?: { contentType?: { sys?: { id: string } } };
        };
        slug: string;
        tabContent: {
          fields?:
            | BannerSliderData
            | CartSuggestedProductsData
            | CategoryProductsData
            | CookieConsentPromptData
            | DesktopCategoriesData
            | FlashSaleData
            | NavHeaderData
            | OpenAppPromptData
            | PromoBannerData
            | RecentlyViewedProductsData
            | SeoContentBlockData
            | TitleAndDescriptionData
            | TopTrendsData
            | WebsiteBannerData
            | WebsiteFooterData
            | YoutubeVideoData;
          sys: TabContentItemSys;
        }[];
      };
    },
  ];
};

export type RecentlyViewedProductsData = {
  maximumProducts: number;
  productsCategoryId?: string;
  richTitle?: Document;
  showRecentlyView?: boolean;
  showViewAll: boolean;
  viewAllUrl?: string;
};

export type SeoContentBlockData = {
  content?: Document;
  internalName?: string;
};

export type TitleAndDescriptionData = {
  description?: Document;
  internalName: string;
  title?: string;
};

export type TopTrendsData = {
  autoSliding?: boolean;
  autoSlidingDelay?: number;
  banners?: {
    fields: ContentfulImageData;
  }[];
  cashbackButtonTitle?: string;
  cashbackButtonUrl?: string;
  cashbackCurrencyImage?: {
    fields: ContentfulImageData;
  };
  cashbackTitle?: Document;
  maximumProducts?: number;
  productsCategoryId?: string;
  showViewAll?: boolean;
  title?: Document;
};

export type WebsiteBannerData = {
  desktopImage: {
    fields: {
      file: {
        url: string;
      };
    };
  };
  elementId?: string;
  flexPercent?: number;
  height?: number;
  internalName?: string;
  margin?: Record<string, any>;
  mobileImage: {
    fields: {
      file: {
        url: string;
      };
    };
  };
  mobileImageHeight?: number;
  mobileImageWidth?: number;
  padding?: Record<string, any>;
  url: string;
  width?: number;
};

export type WebsiteFooterData = {
  contactAndSocialLinks?: WebsiteFooterContactAndSocialLinks;
  copyrightText?: {
    content: any[];
    data: any;
    nodeType: string;
  };
  footerLinks?: WebsiteFooterLinks;
  internalName?: string;
  promoAndFeatures?: WebsiteFooterPromoAndFeatures;
};

export type WebsiteMultipleBannersData = {
  banners: {
    fields: ContentfulImageData;
    sys: { id: string };
  }[];
  imagesHeight?: number;
  imagesHeightMobile?: number;
  imagesWidth?: number;
  imagesWidthMobile?: number;
  internalName?: string;
};

export type YoutubeVideoData = {
  internalName?: string;
  videoUrl?: string;
};

type TabContentItemSys = {
  contentType?: {
    sys: {
      id: TabContentType;
      linkType: string;
      type: string;
    };
  };
  id: string;
};
