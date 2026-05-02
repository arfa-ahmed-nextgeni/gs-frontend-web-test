"use client";

import { useTranslations } from "next-intl";

import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { ProductDetailsLink } from "@/components/shared/product-details-link";
import { CartItem } from "@/lib/models/cart";
import { getProductDetailsHref } from "@/lib/utils/get-product-details-href";

interface GiftItemProps {
  index: number;
  item: CartItem;
}

export const GiftItem = ({ index, item }: GiftItemProps) => {
  const t = useTranslations("CartPage.giftItems");
  const productHref = getProductDetailsHref({
    sku: item.sku,
    urlKey: item.urlKey,
  });

  return (
    <div className="lg:h-25 flex flex-col p-2.5 lg:w-[797px] lg:flex-row lg:items-center lg:justify-between lg:p-2.5 lg:pl-5 lg:rtl:pr-5">
      <div className="flex min-w-0 items-start gap-5 lg:items-center rtl:gap-3">
        {/* Index */}
        <span className="text-text-placeholder flex h-[52px] w-5 shrink-0 items-center justify-center text-sm">
          {index}
        </span>

        {/* Image */}
        <ProductDetailsLink
          className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-md bg-white"
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
        </ProductDetailsLink>

        {/* Title, Description, and Mobile Price */}
        <div className="flex min-w-0 flex-1 items-center">
          <div className="flex min-h-[52px] w-full items-center justify-between gap-4">
            <ProductDetailsLink
              className="block min-w-0 flex-1"
              href={productHref || "#"}
              title={item.name}
            >
              <p className="text-text-primary truncate text-xs font-semibold">
                {item.name}
              </p>
              {item.description && (
                <p className="text-text-primary font-regular line-clamp-2 text-xs">
                  {item.description}
                </p>
              )}
            </ProductDetailsLink>

            {/* Price section - shown inline on mobile */}
            <div className="me-2.5 flex shrink-0 flex-col items-end lg:hidden rtl:items-start">
              <p className="text-text-danger whitespace-nowrap text-[16px] font-semibold">
                {t("freeGiftLabel", { count: item.quantity })}
              </p>
              {item.currentPrice && (
                <LocalizedPrice
                  containerProps={{
                    className:
                      "text-text-secondary whitespace-nowrap text-xs font-light line-through",
                  }}
                  price={item.currentPrice}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Price section */}
      <div className="hidden items-center gap-2 lg:flex rtl:gap-3">
        <p className="text-text-danger text-[16px] font-semibold">
          {t("freeGiftLabel", { count: item.quantity })}
        </p>
        {item.currentPrice && (
          <LocalizedPrice
            containerProps={{
              className:
                "text-text-secondary text-xs font-light line-through pe-7.5 rtl:text-xs",
            }}
            price={item.currentPrice}
          />
        )}
      </div>
    </div>
  );
};
