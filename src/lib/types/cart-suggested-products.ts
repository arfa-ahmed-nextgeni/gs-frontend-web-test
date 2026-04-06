import type { ProductCardModel } from "@/lib/models/product-card-model";

export type CartSuggestedProductsApiData = {
  products: ProductCardModel[];
  title: string;
};
