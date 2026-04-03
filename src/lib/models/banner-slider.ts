import { Helper } from "@/lib/models/helper";
import { TabContentType } from "@/lib/models/page-landing";
import { BannerSliderData } from "@/lib/types/contentful/page-landing";

export class BannerSlider {
  public autoSliding: {
    delay: number;
    enabled: boolean;
  } = {
    delay: 3000,
    enabled: false,
  };
  public contentType: TabContentType;
  public items: BannerSliderItem[] = [];
  public sliderHeight: {
    desktop: number;
    mobile: number;
  } = {
    desktop: 250,
    mobile: 220,
  };

  constructor(data: BannerSliderData, contentType: TabContentType) {
    this.contentType = contentType;
    this.autoSliding = {
      delay: data.autoSlidingDelay || 3000,
      enabled: data.autoSliding || false,
    };
    this.sliderHeight = {
      desktop: data.desktopSliderHeight,
      mobile: data.sliderHeight,
    };
    this.items = data.banners.map(
      ({ fields, sys }) =>
        new BannerSliderItem({
          btnUrl: fields.url,
          elementId: fields.elementId,
          id: sys.id,
          image: {
            height: fields.image.fields.file.details.image.height,
            url: fields.image.fields.file.url,
            width: fields.image.fields.file.details.image.width,
          },
        })
    );
  }
}

export class BannerSliderItem extends Helper {
  public btnText?: string;
  public btnUrl: string;
  public description?: string;
  public elementId?: string;
  public id: string;
  public image: {
    desktop: {
      height?: number;
      url: string;
      width?: number;
    };
    mobile: {
      height?: number;
      url: string;
      width?: number;
    };
  };
  public title?: string;

  constructor({
    btnUrl,
    elementId,
    id,
    image,
  }: {
    btnUrl: string;
    elementId?: string;
    id: string;
    image: {
      height?: number;
      url: string;
      width?: number;
    };
  }) {
    super();
    this.id = id;
    this.elementId = elementId;
    this.btnUrl = btnUrl;
    this.image = {
      desktop: {
        height: image.height,
        url: this.normalizeUrl(image.url),
        width: image.width,
      },
      mobile: {
        height: image.height,
        url: this.normalizeUrl(image.url),
        width: image.width,
      },
    };
  }
}
