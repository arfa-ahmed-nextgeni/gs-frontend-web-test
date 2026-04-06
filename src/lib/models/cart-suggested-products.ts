import type { Document } from "@contentful/rich-text-types";

import { TabContentType } from "@/lib/models/page-landing";

import type { CartSuggestedProductsData } from "@/lib/types/contentful/page-landing";

export class CartSuggestedProducts {
  public contentType: TabContentType;
  public emptyCartFallbackCategoryId?: string;
  public emptyCartFallbackRichTitle?: Document;
  public emptyCartFallbackTitle?: string;
  public enabled: boolean;
  public internalName: string;
  public maximumProducts: number;
  public richTitle?: Document;
  public suggestedProductsCategoryId: string;
  public title: string;

  constructor(data: CartSuggestedProductsData, contentType: TabContentType) {
    this.contentType = contentType;
    this.emptyCartFallbackCategoryId = data.emptyCartFallbackCategoryId;
    this.emptyCartFallbackRichTitle = data.emptyCartFallbackRichTitle;
    this.emptyCartFallbackTitle = data.emptyCartFallbackTitle;
    this.enabled = data.enabled ?? true;
    this.internalName = data.internalName;
    this.maximumProducts = data.maximumProducts;
    this.richTitle = data.richTitle;
    this.suggestedProductsCategoryId = data.suggestedProductsCategoryId;
    this.title = data.title;
  }
}
