import Image from "next/image";

import { useTranslations } from "next-intl";

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

import type { ProductCardClickOriginProps } from "@/components/product/product-card/types/product-card-click-origin-types";

export const ProductCardImage = ({
  categoryId,
  imageUrl,
  isInCarousel,
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
  isInCarousel?: boolean;
  isOutOfStock?: boolean;
  urlKey?: string;
  variant: ProductCardVariant;
} & ProductCardClickOriginProps) => {
  const t = useTranslations("productCard");
  const { className, style } = productCardSizeClasses(variant);
  const isBundlesGrid = variant === ProductCardVariant.Bundles && !isInCarousel;
  const productHref = urlKey?.trim()
    ? ROUTES.PRODUCT.BY_URL_KEY(urlKey)
    : undefined;

  return (
    <div
      className={cn(
        "transition-default relative mx-2.5 mt-2.5 overflow-hidden rounded-xl group-focus-within:mx-5 group-focus-within:mt-5 group-hover:mx-5 group-hover:mt-5 group-has-[button[data-loading=true]]:mx-5 group-has-[button[data-loading=true]]:mt-5",
        className,
        isBundlesGrid && "max-md:mx-auto! max-md:w-[calc(100%-20px)]!"
      )}
      style={style}
    >
      <ProductImageWithFallback
        alt="product image"
        className={cn(
          "size-full object-contain",
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
          className="transition-default pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 group-has-[button[data-loading=true]]:pointer-events-auto group-has-[button[data-loading=true]]:opacity-100"
          href={productHref}
          lpColumn={lpColumn}
          lpExtra={lpExtra}
          lpInnerPosition={lpInnerPosition}
          lpRow={lpRow}
          position={position}
          prefetch={false}
          searchTerm={searchTerm}
          title={t("viewProduct")}
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
