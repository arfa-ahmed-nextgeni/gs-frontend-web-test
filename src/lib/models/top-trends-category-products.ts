import { CategoryProducts } from "@/lib/models/category-products";
import { ResponsiveImage } from "@/lib/models/responsive-image";

import type { TabContentType } from "@/lib/models/page-landing";
import type {
  ContentfulImageData,
  TopTrendsData,
} from "@/lib/types/contentful/page-landing";

const toResponsiveImage = (banner: { fields: ContentfulImageData }) =>
  new ResponsiveImage({
    desktop: {
      height: banner.fields.image.fields.file.details.image.height,
      url: banner.fields.image.fields.file.url || "",
      width: banner.fields.image.fields.file.details.image.width,
    },
    elementId: banner.fields.elementId,
    mobile: {
      height: banner.fields.image.fields.file.details.image.height,
      url: banner.fields.image.fields.file.url || "",
      width: banner.fields.image.fields.file.details.image.width,
    },
    redirectUrl: banner.fields.url,
  });

export class TopTrendsCategoryProducts extends CategoryProducts {
  public autoSliding: {
    delay: number;
    enabled: boolean;
  } = {
    delay: 3000,
    enabled: false,
  };
  public desktopBannerImages?: ResponsiveImage[];
  public mobileBannerImages?: ResponsiveImage[];

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

    this.autoSliding = {
      delay: data.autoSlidingDelay || 3000,
      enabled: data.autoSliding || false,
    };
    this.desktopBannerImages = data.desktopBanners?.map(toResponsiveImage);
    this.mobileBannerImages = data.mobileBanners?.map(toResponsiveImage);
  }
}
