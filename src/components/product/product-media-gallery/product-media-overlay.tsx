"use client";

import Image from "next/image";

import HalfStarIcon from "@/assets/icons/half-star-icon.svg";
import StarIcon from "@/assets/icons/star-icon.svg";
import { ProductCardBadge } from "@/components/product/product-card/product-card-badge";
import { useProductDetails } from "@/contexts/product-details-context";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { ProductBadgeType } from "@/lib/constants/product/product-card";
import { ProductType } from "@/lib/constants/product/product-details";
import { cn } from "@/lib/utils";

export const ProductMediaOverlay = () => {
  const { product, selectedProduct } = useProductDetails();

  const isMobile = useIsMobile();

  const isExclusive = selectedProduct?.isExclusive;
  const isNew = selectedProduct?.isNew;
  const productTags = selectedProduct?.productTags;
  const hasProductTags = Boolean(productTags && productTags.length > 0);

  const noAnyBadge = !isExclusive && !isNew && !hasProductTags;

  return (
    <div
      className={cn(
        "lg:h-25 absolute inset-0 top-0 h-20 bg-[linear-gradient(0deg,rgba(255,255,255,0)_0%,#FFF_50%)]",
        {
          "bg-none": noAnyBadge && !isMobile,
        }
      )}
    >
      <div className="flex w-full flex-row items-center justify-between px-5 pt-5">
        <div className="gap-1.25 flex flex-row">
          {isExclusive && (
            <ProductCardBadge badge={{ type: ProductBadgeType.Exclusive }} />
          )}
          {isNew && (
            <ProductCardBadge badge={{ type: ProductBadgeType.NewArrival }} />
          )}
          {hasProductTags &&
            productTags?.map(({ backgroundColor, color, title }) => (
              <ProductCardBadge
                badge={{
                  backgroundColor,
                  color,
                  type: ProductBadgeType.Custom,
                  value: title,
                }}
                key={title}
              />
            ))}
        </div>
        {product.type !== ProductType.EGiftCard && !!product.averageRating && (
          <div className="flex flex-row items-center gap-1 lg:hidden" dir="ltr">
            <Image
              alt="rating"
              className="size-2.75"
              height={11}
              src={product.averageRating >= 5 ? StarIcon : HalfStarIcon}
              unoptimized
              width={11}
            />
            <p className="text-text-secondary text-xs font-medium leading-none">
              {product.averageRating}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
