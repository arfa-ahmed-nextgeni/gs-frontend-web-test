"use client";

import { useTranslations } from "next-intl";

import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { ProductDetailsLink } from "@/components/shared/product-details-link";
import { CartItem } from "@/lib/models/cart";
import { cn } from "@/lib/utils";
import { getProductDetailsHref } from "@/lib/utils/get-product-details-href";

interface GiftItemProps {
  index: number;
  item: CartItem;
}

export const GiftItem = ({ index, item }: GiftItemProps) => {
  const t = useTranslations("CartPage");
  const productHref = getProductDetailsHref({
    sku: item.sku,
    urlKey: item.urlKey,
  });
  const freeGiftLabel = t("giftItems.freeGiftLabel");
  const quantityLabel = t("giftItems.quantity", {
    count: String(item.quantity),
  });
  const shouldShowCurrentPrice =
    item.priceValue > 0 && item.currentPrice.trim().length > 0;

  return (
    <div className="lg:h-25 lg:w-199.25 flex flex-col p-2.5 lg:flex-row lg:items-center lg:justify-between lg:p-2.5 lg:pl-5 lg:rtl:pr-5">
      <div className="flex min-w-0 items-start gap-5 lg:items-center rtl:gap-3">
        {/* Index */}
        <span className="text-text-placeholder h-13 flex w-5 shrink-0 items-center justify-center text-sm">
          {index}
        </span>

        {/* Image */}
        <ProductDetailsLink
          className="w-13 h-13 relative shrink-0 overflow-hidden rounded-md bg-white"
          href={productHref || "#"}
          title={item.name}
        >
          <ProductImageWithFallback
            alt={item.name}
            className="h-full w-full object-cover"
            height={52}
            src={item.imageUrl}
            width={52}
          />
          {item.isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="h-6.25 flex items-center justify-center gap-2.5 rounded-lg bg-black/50 px-2.5 py-2 text-[11px] font-medium leading-none text-white">
                {t("outOfStock")}
              </span>
            </div>
          )}
        </ProductDetailsLink>

        {/* Title, Description, and Mobile Price */}
        <div className="flex min-w-0 flex-1 items-center">
          <div className="min-h-13 flex w-full items-center justify-between gap-4">
            <ProductDetailsLink
              className="block min-w-0 flex-1"
              href={productHref || "#"}
              title={item.name}
            >
              <p className="text-text-primary truncate text-xs font-semibold">
                {item.name}
                <span className="text-text-danger ms-1 text-sm font-bold">
                  {quantityLabel}
                </span>
              </p>
              {item.description && (
                <p className="text-text-primary font-regular line-clamp-2 text-xs">
                  {item.description}
                </p>
              )}
            </ProductDetailsLink>

            {/* Price section - shown inline on mobile */}
            <div className="me-2.5 flex shrink-0 flex-col items-end lg:hidden rtl:items-start">
              <p
                className={cn(
                  "text-text-danger whitespace-nowrap text-[16px] font-semibold",
                  { "text-text-primary": !shouldShowCurrentPrice }
                )}
              >
                {freeGiftLabel}
              </p>
              {shouldShowCurrentPrice && (
                <LocalizedPrice
                  containerProps={{
                    className:
                      "text-text-secondary whitespace-nowrap text-xs font-light",
                  }}
                  price={item.currentPrice}
                  valueProps={{
                    className: "line-through",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Price section */}
      <div className="pe-7.5 hidden items-center gap-3 lg:flex">
        <p
          className={cn("text-text-danger text-[16px] font-semibold", {
            "text-text-primary": !shouldShowCurrentPrice,
          })}
        >
          {freeGiftLabel}
        </p>
        {shouldShowCurrentPrice && (
          <LocalizedPrice
            containerProps={{
              className: "text-text-secondary text-xs font-light rtl:text-xs",
            }}
            price={item.currentPrice}
            valueProps={{ className: "line-through" }}
          />
        )}
      </div>
    </div>
  );
};
