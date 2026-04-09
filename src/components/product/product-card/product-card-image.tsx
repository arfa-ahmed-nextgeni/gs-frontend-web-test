import Image from "next/image";

import EyeViewIcon from "@/assets/icons/eye-view-icon.svg";
import { ProductCardImageLink } from "@/components/product/product-card/product-card-image-link";
import { productCardSizeClasses } from "@/components/product/product-card/utils/product-card-utils";
import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import {
  PRODUCT_CARD_DIMENSIONS,
  ProductCardVariant,
} from "@/lib/constants/product/product-card";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { getShimmerPlaceholder } from "@/lib/utils/image";

import type { ProductCardClickOriginProps } from "@/components/product/product-card/types/product-card-click-origin-types";

export const ProductCardImage = ({
  categoryId,
  imageUrl,
  isOutOfStock,
  lpColumn,
  lpExtra,
  lpInnerPosition,
  lpRow,
  position,
  searchTerm,
  urlKey,
  variant,
}: {
  imageUrl: string;
  isOutOfStock?: boolean;
  urlKey?: string;
  variant: ProductCardVariant;
} & ProductCardClickOriginProps) => {
  const { className, style } = productCardSizeClasses(variant);
  const productHref = urlKey?.trim()
    ? ROUTES.PRODUCT.BY_URL_KEY(urlKey)
    : undefined;

  return (
    <div
      className={cn(
        "transition-default relative mx-2.5 mt-2.5 overflow-hidden rounded-xl group-focus-within:mx-5 group-focus-within:mt-5 group-hover:mx-5 group-hover:mt-5 group-has-[button[data-loading=true]]:mx-5 group-has-[button[data-loading=true]]:mt-5",
        className
      )}
      style={style}
    >
      <ProductImageWithFallback
        alt="product image"
        className={cn(
          "transition-default size-full object-contain opacity-100",
          {
            "group-focus-within:opacity-50 group-focus-within:grayscale group-hover:opacity-50 group-hover:grayscale group-has-[button[data-loading=true]]:opacity-50 group-has-[button[data-loading=true]]:grayscale":
              isOutOfStock,
          },
          variant === ProductCardVariant.Bundles
            ? "aspect-[var(--card-w)/var(--card-h)]"
            : "aspect-square"
        )}
        fill
        key={imageUrl}
        placeholder={getShimmerPlaceholder()}
        sizes={
          variant === ProductCardVariant.Bundles
            ? `(max-width: 768px) 30vw, ${PRODUCT_CARD_DIMENSIONS[ProductCardVariant.Bundles].default.w}px`
            : `(max-width: 768px) 22vw, ${PRODUCT_CARD_DIMENSIONS[ProductCardVariant.Single].default.w}px`
        }
        src={imageUrl}
      />
      {productHref ? (
        <ProductCardImageLink
          categoryId={categoryId}
          className="transition-default pointer-events-none absolute flex h-full w-full items-center justify-center opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 group-has-[button[data-loading=true]]:pointer-events-auto group-has-[button[data-loading=true]]:opacity-100"
          href={productHref}
          lpColumn={lpColumn}
          lpExtra={lpExtra}
          lpInnerPosition={lpInnerPosition}
          lpRow={lpRow}
          position={position}
          prefetch={false}
          searchTerm={searchTerm}
          title="View product details"
        >
          <Image
            alt="view product icon"
            height={30}
            src={EyeViewIcon}
            unoptimized
            width={30}
          />
        </ProductCardImageLink>
      ) : null}
    </div>
  );
};
