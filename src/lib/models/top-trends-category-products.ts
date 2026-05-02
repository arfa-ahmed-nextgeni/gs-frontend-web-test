import type { Document } from "@contentful/rich-text-types";

import { CategoryProducts } from "@/lib/models/category-products";
import { ResponsiveImage } from "@/lib/models/responsive-image";

import type { TabContentType } from "@/lib/models/page-landing";
import type { TopTrendsData } from "@/lib/types/contentful/page-landing";

export class TopTrendsCategoryProducts extends CategoryProducts {
  public autoSliding: {
    delay: number;
    enabled: boolean;
  } = {
    delay: 3000,
    enabled: false,
  };
  public bannerImages?: ResponsiveImage[];
  public cashbackButtonTitle?: string;
  public cashbackButtonUrl?: string;
  public cashbackCurrencyImage?: ResponsiveImage;
  public cashbackTitle?: Document;

  constructor(data: TopTrendsData, contentType: TabContentType) {
    super(
      {
        maximumProducts: data.maximumProducts || 0,
        productsCategoryId: data.productsCategoryId || "",
        richTitle: data.title,
        showViewAll: data.showViewAll || false,
        title: "",
      },
      contentType
    );

    this.cashbackTitle = data.cashbackTitle;
    this.cashbackButtonTitle = data.cashbackButtonTitle;
    this.cashbackButtonUrl = data.cashbackButtonUrl;
    this.autoSliding = {
      delay: data.autoSlidingDelay || 3000,
      enabled: data.autoSliding || false,
    };
    this.cashbackCurrencyImage = new ResponsiveImage({
      desktop: {
        height:
          data.cashbackCurrencyImage?.fields.image.fields.file.details.image
            .height,
        url: data.cashbackCurrencyImage?.fields.image.fields.file.url || "",
        width:
          data.cashbackCurrencyImage?.fields.image.fields.file.details.image
            .width,
      },
      mobile: {
        height:
          data.cashbackCurrencyImage?.fields.image.fields.file.details.image
            .height,
        url: data.cashbackCurrencyImage?.fields.image.fields.file.url || "",
        width:
          data.cashbackCurrencyImage?.fields.image.fields.file.details.image
            .width,
      },
      redirectUrl: data.cashbackCurrencyImage?.fields.url,
    });
    this.bannerImages = data.banners?.map(
      (image) =>
        new ResponsiveImage({
          desktop: {
            height: image.fields.image.fields.file.details.image.height,
            url: image.fields.image.fields.file.url || "",
            width: image.fields.image.fields.file.details.image.width,
          },
          elementId: image.fields.elementId,
          mobile: {
            height: image.fields.image.fields.file.details.image.height,
            url: image.fields.image.fields.file.url || "",
            width: image.fields.image.fields.file.details.image.width,
          },
          redirectUrl: image.fields.url,
        })
    );
  }
}
