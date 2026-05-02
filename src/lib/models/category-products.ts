import type { Document } from "@contentful/rich-text-types";

import { ProductCardVariant } from "@/lib/constants/product/product-card";
import { TabContentType } from "@/lib/models/page-landing";
import { ProductCardModel } from "@/lib/models/product-card-model";
import { CategoryProductsData } from "@/lib/types/contentful/page-landing";

export class CategoryProducts {
  public contentType: TabContentType;
  public grid: boolean;
  public maximumProducts: number;
  public products?: ProductCardModel[] = [];
  public productsCategoryId: string;
  public richTitle?: Document;
  public showClearHistory?: boolean;
  public showViewAll: boolean;
  public title: string;
  public variant: ProductCardVariant;

  constructor(data: CategoryProductsData, contentType: TabContentType) {
    this.title = data.title;
    this.showViewAll = data.showViewAll;
    this.productsCategoryId = data.productsCategoryId || "";
    this.maximumProducts = data.maximumProducts;
    this.grid = data.grid ?? false;
    this.richTitle = data.richTitle;
    this.contentType = contentType;
    this.variant = data.bundlesVariant
      ? ProductCardVariant.Bundles
      : ProductCardVariant.Single;
    this.showClearHistory = data.showClearHistory;
  }
}
