import type { ProductCardModel } from "@/lib/models/product-card-model";

export interface ProductCardClickOriginProps {
  categoryId?: number;
  lpColumn?: number;
  lpExtra?: Record<string, unknown>;
  lpInnerPosition?: number;
  lpRow?: number;
  position?: number;
  searchTerm?: string;
}

export interface ProductCardInteractionProps extends ProductCardClickOriginProps {
  product: ProductCardModel;
}
