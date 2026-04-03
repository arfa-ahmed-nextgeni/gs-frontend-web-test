import { TabContentType } from "@/lib/models/page-landing";
import { WebsiteBannerData } from "@/lib/types/contentful/page-landing";

export class WebsiteBanner {
  public contentType: TabContentType;
  public desktopImageUrl?: string;
  public elementId?: string;
  public flexPercent?: number;
  public height?: number;
  public internalName?: string;
  public margin?: Record<string, any>;
  public mobileImageHeight?: number;
  public mobileImageUrl?: string;
  public mobileImageWidth?: number;
  public padding?: Record<string, any>;
  public url: string;
  public width?: number;

  constructor(data: WebsiteBannerData, contentType: TabContentType) {
    this.contentType = contentType;
    this.elementId = data.elementId;
    this.internalName = data.internalName;
    this.url = data.url;
    this.width = data.width;
    this.height = data.height;
    this.mobileImageWidth = data.mobileImageWidth;
    this.mobileImageHeight = data.mobileImageHeight;
    this.padding = data.padding;
    this.margin = data.margin;
    this.flexPercent = data.flexPercent;
    this.desktopImageUrl = data.desktopImage?.fields?.file?.url;
    this.mobileImageUrl = data.mobileImage?.fields?.file?.url;
  }
}
