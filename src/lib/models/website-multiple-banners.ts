import { TabContentType } from "@/lib/models/page-landing";
import { WebsiteMultipleBannersData } from "@/lib/types/contentful/page-landing";

export class WebsiteMultipleBanner {
  public contentType: TabContentType;
  public elementId?: string;
  public id: string;
  public imagesHeight?: number;
  public imagesWidth?: number;
  public imageUrl?: string;
  public label: string;
  public url: string;

  constructor({
    contentType,
    elementId,
    id,
    imagesHeight,
    imagesWidth,
    imageUrl,
    label,
    url,
  }: {
    contentType: TabContentType;
    elementId?: string;
    id: string;
    imagesHeight?: number;
    imagesWidth?: number;
    imageUrl?: string;
    label: string;
    url: string;
  }) {
    this.id = id;
    this.elementId = elementId;
    this.imagesHeight = imagesHeight;
    this.imagesWidth = imagesWidth;
    this.imageUrl = imageUrl;
    this.label = label;
    this.url = url;
    this.contentType = contentType;
  }
}

export class WebsiteMultipleBanners {
  public banners: WebsiteMultipleBanner[] = [];
  public contentType: TabContentType;
  public imagesHeight?: number;
  public imagesHeightMobile?: number;
  public imagesWidth?: number;
  public imagesWidthMobile?: number;
  public internalName?: string;

  constructor(data: WebsiteMultipleBannersData, contentType: TabContentType) {
    this.contentType = contentType;
    this.internalName = data.internalName;
    this.imagesHeight = data.imagesHeight;
    this.imagesWidth = data.imagesWidth;
    this.imagesHeightMobile = data.imagesHeightMobile;
    this.imagesWidthMobile = data.imagesWidthMobile;
    this.banners = data.banners.map(
      ({ fields, sys }) =>
        new WebsiteMultipleBanner({
          contentType,
          elementId: fields.elementId,
          id: sys.id,
          imageUrl: fields.image?.fields?.file?.url,
          label: fields.label,
          url: fields.url,
        })
    );
  }
}
