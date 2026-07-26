import type { ProductCardModel } from "@/lib/models/product-card-model";
import type { ContentDisplayOn } from "@/lib/types/contentful/display-on";

export type CartSuggestedProductsApiData = {
  sections: CartSuggestedProductsApiSection[];
};

export type CartSuggestedProductsApiSection = {
  displayOn: ContentDisplayOn;
  id: string;
  products: ProductCardModel[];
  title: string;
};
