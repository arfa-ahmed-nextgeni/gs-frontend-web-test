import type { Document } from "@contentful/rich-text-types";

import { TabContentType } from "@/lib/models/page-landing";

import type { ContentDisplayOn } from "@/lib/types/contentful/display-on";
import type { CartSuggestedProductsData } from "@/lib/types/contentful/page-landing";

export class CartSuggestedProducts {
  public contentType: TabContentType;
  public displayOn: ContentDisplayOn;
  public emptyCartFallbackCategoryId?: string;
  public emptyCartFallbackRichTitle?: Document;
  public emptyCartFallbackTitle?: string;
  public enabled: boolean;
  public entryId: string;
  public internalName: string;
  public maximumProducts: number;
  public richTitle?: Document;
  public suggestedProductsCategoryId: string;
  public title: string;

  constructor(
    data: CartSuggestedProductsData,
    contentType: TabContentType,
    entryId: string
  ) {
    this.contentType = contentType;
    this.displayOn = data.displayOn ?? "all";
    this.emptyCartFallbackCategoryId = data.emptyCartFallbackCategoryId;
    this.emptyCartFallbackRichTitle = data.emptyCartFallbackRichTitle;
    this.emptyCartFallbackTitle = data.emptyCartFallbackTitle;
    this.enabled = data.enabled ?? true;
    this.entryId = entryId;
    this.internalName = data.internalName;
    this.maximumProducts = data.maximumProducts;
    this.richTitle = data.richTitle;
    this.suggestedProductsCategoryId = data.suggestedProductsCategoryId;
    this.title = data.title;
  }
}
