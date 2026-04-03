import { Helper } from "@/lib/models/helper";

export class ResponsiveImage extends Helper {
  public desktop: {
    height?: number;
    url: string;
    width?: number;
  };
  public elementId?: string;
  public mobile: {
    height?: number;
    url: string;
    width?: number;
  };
  public redirectUrl?: string;

  constructor(data: {
    desktop: {
      height?: number;
      url: string;
      width?: number;
    };
    elementId?: string;
    mobile: {
      height?: number;
      url: string;
      width?: number;
    };
    redirectUrl?: string;
  }) {
    super();
    this.desktop = {
      height: data.desktop.height,
      url: this.normalizeUrl(data.desktop.url),
      width: data.desktop.width,
    };
    this.mobile = {
      height: data.mobile.height,
      url: this.normalizeUrl(data.mobile.url),
      width: data.mobile.width,
    };
    this.redirectUrl = data.redirectUrl;
    this.elementId = data.elementId;
  }
}
