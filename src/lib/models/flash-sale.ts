import { CategoryProducts } from "@/lib/models/category-products";
import { TabContentType } from "@/lib/models/page-landing";
import { FlashSaleData } from "@/lib/types/contentful/page-landing";

export class FlashSale extends CategoryProducts {
  public autoSlideDelay?: number;
  public autoSliding?: boolean;
  public endTime?: string;
  public endTimezone?: string;
  public saleIcon?: string;
  public saleProductCategoryId?: string;
  public saleUrl?: string;
  public startTime?: string;
  public startTimezone?: string;
  public subtitle?: string;

  constructor(data: FlashSaleData, contentType: TabContentType) {
    const categoryProductsData = {
      maximumProducts: data.maximumProducts || 10,
      productsCategoryId: data.productsCategoryId || "",
      richTitle: undefined,
      showViewAll: data.showViewAll || false,
      title: data.title || "",
    };

    super(categoryProductsData, contentType);

    this.autoSliding = data.autoSliding ?? true;
    this.autoSlideDelay = data.autoSlideDelay ?? 5000;
    this.saleIcon = data.saleIcon?.fields?.file?.url || "";
    this.startTime = data.startTime;
    this.startTimezone = data.startTimezone;
    this.endTime = data.endTime;
    this.endTimezone = data.endTimezone;
    this.saleProductCategoryId = data.productsCategoryId;
    this.saleUrl = data.saleUrl;
    this.subtitle = data.subtitle;
  }
}
