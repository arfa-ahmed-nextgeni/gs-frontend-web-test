import type { ComponentProps } from "react";

import { ProductCardActions } from "@/components/product/product-card/product-card-actions";
import { ProductCardBadges } from "@/components/product/product-card/product-card-badges";
import { ProductCardCountdownVisibilityProvider } from "@/components/product/product-card/product-card-countdown-visibility-context";
import { ProductCardHeader } from "@/components/product/product-card/product-card-header";
import { ProductCardImage } from "@/components/product/product-card/product-card-image";
import { ProductCardPrice } from "@/components/product/product-card/product-card-price";
import { ProductCardStatusBadges } from "@/components/product/product-card/product-card-status-badges";
import { ProductCardVariant } from "@/lib/constants/product/product-card";
import { ProductCardModel } from "@/lib/models/product-card-model";
import { cn } from "@/lib/utils";

import type { ProductCardClickOriginProps } from "@/components/product/product-card/types/product-card-click-origin-types";

export const ProductCard = ({
  categoryId,
  containerProps,
  isBulletDeliveryEnabled,
  isInCarousel,
  isWishlistItem,
  lpColumn,
  lpExtra,
  lpInnerPosition,
  lpRow,
  position,
  product,
  searchTerm,
}: {
  containerProps?: ComponentProps<"div">;
  isBulletDeliveryEnabled: boolean;
  isInCarousel?: boolean;
  isWishlistItem?: boolean;
  product: ProductCardModel;
} & ProductCardClickOriginProps) => {
  const isConfigurable = !!product.options?.choices?.length;
  const isBundles = product.variant === ProductCardVariant.Bundles;
  const priceAndBadgesContent = (
    <>
      <ProductCardPrice
        containerProps={{
          className: cn(isWishlistItem && !isConfigurable && "mt-2"),
        }}
        countdownTimer={product.countdownTimer}
        oldPrice={product.oldPrice}
        price={product.currentPrice}
      />

      <ProductCardBadges
        badges={product.badges}
        countdownTimer={product.countdownTimer}
        options={product.options}
        variant={product.variant}
      />
    </>
  );

  return (
    <div
      {...containerProps}
      className={cn(
        "h-77.5 transition-default bg-bg-default group relative overflow-hidden rounded-xl",
        "sm:w-43 w-[calc(50vw-15px)] md:w-full",
        "lg:w-48",
        "[contain-intrinsic-size:192px_310px] [content-visibility:auto]",
        {
          "[contain-intrinsic-size:240px_310px] sm:w-60 md:w-60 lg:w-60":
            isBundles,
          "w-60": isBundles && isInCarousel,
        },
        containerProps?.className
      )}
      data-product-card-root
      tabIndex={0}
    >
      <ProductCardImage
        categoryId={categoryId}
        imageUrl={product.imageUrl}
        isInCarousel={isInCarousel}
        isOutOfStock={product.isOutOfStock}
        lpColumn={lpColumn}
        lpExtra={lpExtra}
        lpInnerPosition={lpInnerPosition}
        lpRow={lpRow}
        position={position}
        searchTerm={searchTerm}
        urlKey={product.urlKey}
        variant={product.variant}
      />

      <ProductCardStatusBadges
        bulletDelivery={product.bulletDelivery}
        discountPercent={product.discountPercent}
        isBulletDeliveryEnabled={isBulletDeliveryEnabled}
        stockStatus={product.stockStatus}
      />

      <ProductCardHeader
        brand={product.brand}
        isConfigurable={isConfigurable}
        isWishlistItem={isWishlistItem}
        name={product.name}
        rating={product.rating}
        savedPrice={product.savedPrice}
        variant={product.variant}
      />

      {product.countdownTimer?.enabled ? (
        <ProductCardCountdownVisibilityProvider>
          {priceAndBadgesContent}
        </ProductCardCountdownVisibilityProvider>
      ) : (
        priceAndBadgesContent
      )}

      <ProductCardActions
        categoryId={categoryId}
        isWishlistItem={isWishlistItem}
        lpColumn={lpColumn}
        lpExtra={lpExtra}
        lpInnerPosition={lpInnerPosition}
        lpRow={lpRow}
        position={position}
        product={structuredClone(product)}
        searchTerm={searchTerm}
      />
    </div>
  );
};
