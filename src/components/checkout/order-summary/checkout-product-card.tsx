"use client";

import { useTranslations } from "next-intl";

import { ProductCardPrice } from "@/components/product/product-card/product-card-price";
import { StoreConfiguredProductCardBulletDelivery } from "@/components/product/product-card/store-configured-product-card-bullet-delivery";
import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { ProductDetailsLink } from "@/components/shared/product-details-link";
import { CartItem } from "@/lib/models/cart";
import { getProductDetailsHref } from "@/lib/utils/get-product-details-href";

export const CheckoutProductCard = ({ item }: { item: CartItem }) => {
  const t = useTranslations("CheckoutPage.orderSummary");
  const productHref = getProductDetailsHref({
    sku: item.sku,
    urlKey: item.urlKey,
  });

  return (
    <div className="relative flex h-[90px] items-center gap-3 rounded-[10px] border border-[#F3F3F3] p-3">
      {item.imageUrl && (
        <ProductDetailsLink
          className="bg-bg-default relative size-14 shrink-0 overflow-hidden rounded-md"
          href={productHref || "#"}
          title={item.name}
        >
          <ProductImageWithFallback
            alt={item.name}
            className="object-contain"
            height={80}
            src={item.imageUrl}
            width={80}
          />
        </ProductDetailsLink>
      )}
      <ProductDetailsLink
        className="flex flex-col text-sm"
        href={productHref || "#"}
        title={item.name}
      >
        <span className="text-text-primary line-clamp-1 text-xs font-semibold">
          {item.brand}
        </span>
        <span className="text-text-primary line-clamp-1 text-xs font-normal">
          {item.name}
        </span>
        <div className="mt-1 flex items-center gap-2">
          <ProductCardPrice
            containerProps={{
              className: "px-0",
            }}
            countdownTimer={item.countdownTimer}
            oldPrice={item.oldPrice}
            price={item.currentPrice}
          />
          <span className="text-xs font-normal text-[#85878A]">
            {t("quantity", {
              qty: item.quantity.toString(),
            })}
          </span>
        </div>
      </ProductDetailsLink>

      <div className="absolute start-1.5 top-1.5 flex flex-row gap-0.5">
        {item.bulletDelivery && <StoreConfiguredProductCardBulletDelivery />}
      </div>
    </div>
  );
};
