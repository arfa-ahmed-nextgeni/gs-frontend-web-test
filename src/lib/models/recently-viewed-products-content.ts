import type { Document } from "@contentful/rich-text-types";

import { TabContentType } from "@/lib/models/page-landing";

import type { ContentDisplayOn } from "@/lib/types/contentful/display-on";
import type { RecentlyViewedProductsData } from "@/lib/types/contentful/page-landing";

export class RecentlyViewedProductsContent {
  public contentType: TabContentType;
  public displayOn: ContentDisplayOn;
  public maximumProducts: number;
  public productsCategoryId?: string;
  public richTitle?: Document;
  public showRecentlyView: boolean;
  public showViewAll: boolean;
  public viewAllUrl?: string;

  constructor(data: RecentlyViewedProductsData, contentType: TabContentType) {
    this.contentType = contentType;
    this.displayOn = data.displayOn ?? "all";
    this.viewAllUrl = data.viewAllUrl;
    this.maximumProducts = data.maximumProducts ?? 6;
    this.productsCategoryId = data.productsCategoryId;
    this.richTitle = data.richTitle;
    this.showRecentlyView = data.showRecentlyView ?? true;
    this.showViewAll = data.showViewAll ?? false;
  }
}
