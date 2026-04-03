"use client";

import Image from "next/image";

import { useTranslations } from "next-intl";

import { ProductCardBulletDelivery } from "@/components/product/product-card/product-card-bullet-delivery";
import { ProductCardPrice } from "@/components/product/product-card/product-card-price";
import { CartItem } from "@/lib/models/cart";

export const CheckoutProductCard = ({ item }: { item: CartItem }) => {
  const t = useTranslations("CheckoutPage.orderSummary");

  return (
    <div className="relative flex h-[90px] items-center gap-3 rounded-[10px] border border-[#F3F3F3] p-3">
      {item.imageUrl && (
        <div className="bg-bg-default relative size-14 shrink-0 overflow-hidden rounded-md">
          <Image
            alt={item.name}
            className="object-contain"
            height={80}
            src={item.imageUrl}
            width={80}
          />
        </div>
      )}
      <div className="flex flex-col text-sm">
        <span className="text-text-primary text-xs font-semibold">
          {item.name}
        </span>
        {item.description && (
          <span className="text-text-tertiary line-clamp-1 text-xs font-normal">
            {item.description.replace(/<[^>]*>/g, "")}
          </span>
        )}
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
      </div>

      <div className="absolute start-1.5 top-1.5 flex flex-row gap-0.5">
        {item.bulletDelivery && <ProductCardBulletDelivery />}
      </div>
    </div>
  );
};
