import Image from "next/image";

import { useTranslations } from "next-intl";

import StarIcon from "@/assets/icons/star-icon.svg";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { ProductCardVariant } from "@/lib/constants/product/product-card";
import { cn } from "@/lib/utils";

export const ProductCardHeader = ({
  description,
  rating,
  savedPrice,
  title,
  variant,
}: {
  description: string;
  rating?: number;
  savedPrice?: string;
  title: string;
  variant: ProductCardVariant;
}) => {
  const t = useTranslations("productCard");

  return (
    <div className="relative mt-1 flex flex-col gap-1 px-5">
      <div className="flex flex-row items-center justify-between gap-0.5">
        <div
          className={cn(
            "text-text-primary line-clamp-1 text-xs font-semibold",
            variant === ProductCardVariant.Bundles &&
              savedPrice &&
              "text-text-brand text-xs font-semibold"
          )}
        >
          {variant === ProductCardVariant.Bundles
            ? savedPrice
              ? t.rich("bundleProductTitle", {
                  price: () => <LocalizedPrice price={savedPrice} />,
                })
              : title
            : title}
        </div>
        {rating && rating >= 4 && (
          <div
            className="flex shrink-0 flex-row items-center gap-0.5"
            dir="ltr"
          >
            <Image
              alt="product rating"
              className="size-2.5"
              height={10}
              src={StarIcon}
              unoptimized
              width={10}
            />
            <div className="text-text-secondary leading-2.5 text-[10px] font-medium">
              {rating}
            </div>
          </div>
        )}
      </div>
      <div className="text-text-primary line-clamp-2 min-h-8 text-xs font-normal">
        {description}
      </div>
    </div>
  );
};
