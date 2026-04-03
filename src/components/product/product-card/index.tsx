import { ComponentProps } from "react";

import { ProductCardActions } from "@/components/product/product-card/product-card-actions";
import { ProductCardBadges } from "@/components/product/product-card/product-card-badges";
import { ProductCardProvider } from "@/components/product/product-card/product-card-context";
import { ProductCardHeader } from "@/components/product/product-card/product-card-header";
import { ProductCardImage } from "@/components/product/product-card/product-card-image";
import { ProductCardPrice } from "@/components/product/product-card/product-card-price";
import { ProductCardStatusBadges } from "@/components/product/product-card/product-card-status-badges";
import { ProductCardModel } from "@/lib/models/product-card-model";

export const ProductCard = ({
  categoryId,
  containerProps,
  lpColumn,
  lpExtra,
  lpInnerPosition,
  lpRow,
  position,
  product,
  searchTerm,
}: {
  categoryId?: number;
  containerProps?: ComponentProps<"div">;
  lpColumn?: number;
  lpExtra?: Record<string, unknown>;
  lpInnerPosition?: number;
  lpRow?: number;
  position?: number;
  product: ProductCardModel;
  searchTerm?: string;
}) => {
  return (
    <ProductCardProvider
      categoryId={categoryId}
      containerProps={containerProps}
      lpColumn={lpColumn}
      lpExtra={lpExtra}
      lpInnerPosition={lpInnerPosition}
      lpRow={lpRow}
      position={position}
      product={structuredClone(product)}
      searchTerm={searchTerm}
    >
      <ProductCardImage
        imageUrl={product.imageUrl}
        isOutOfStock={product.isOutOfStock}
        urlKey={product.urlKey}
        variant={product.variant}
      />

      <ProductCardStatusBadges
        bulletDelivery={product.bulletDelivery}
        discountPercent={product.discountPercent}
        stockStatus={product.stockStatus}
      />

      <ProductCardHeader
        description={product.description}
        rating={product.rating}
        savedPrice={product.savedPrice}
        title={product.name}
        variant={product.variant}
      />

      <ProductCardPrice
        countdownTimer={product.countdownTimer}
        oldPrice={product.oldPrice}
        price={product.currentPrice}
      />

      <ProductCardBadges
        badges={product.badges}
        options={product.options}
        variant={product.variant}
      />

      <ProductCardActions />
    </ProductCardProvider>
  );
};
