import { ProductTags } from "@/lib/types/product/product-tags";

export type AssociatedProducts = {
  [key: string]: AssociatedProduct;
};

export type GalleryItem = {
  file?: string;
  mediaType: string;
  video_description?: string;
  video_title?: string;
  video_url?: string;
};

type AssociatedProduct = {
  color_swatch: any;
  countdown_timer?: {
    countdown_timer_enabled: boolean;
    countdown_timer_end_date: null | string;
    countdown_timer_start_date: null | string;
    countdown_timer_subtitle: null | string;
    countdown_timer_title: null | string;
  };
  exclusive: string;
  express_delivery_available: boolean | string;
  externalId: string;
  final_price: number;
  gallery?: GalleryItem[];
  image?: string;
  is_new: string;
  low_stock_qty: null | string;
  news_from_date: string;
  product_tags: ProductTags;
  regular_price: number;
  sku: string;
  value_off: {
    amount_off: number;
    percent_off: string;
  };
};
