"use client";

import Image from "next/image";

import { useTranslations } from "next-intl";

import TrashIcon from "@/assets/icons/trash-icon.svg";
import { ProductCardPrice } from "@/components/product/product-card/product-card-price";
import { StoreConfiguredProductCardBulletDelivery } from "@/components/product/product-card/store-configured-product-card-bullet-delivery";
import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { ProductDetailsLink } from "@/components/shared/product-details-link";
import { Spinner } from "@/components/ui/spinner";
import { useRemoveProductFromCart } from "@/hooks/mutations/cart/use-remove-product-from-cart";
import { ProductOption } from "@/lib/models/product-card-model";
import { cn } from "@/lib/utils";
import { getProductDetailsHref } from "@/lib/utils/get-product-details-href";

import type { CountdownTimer } from "@/lib/types/product/countdown-timer";

interface CheckoutProductCardItem {
  brand: string;
  bulletDelivery?: boolean;
  countdownTimer?: CountdownTimer | null;
  currentPrice: string;
  imageUrl: string;
  isGwp?: boolean;
  isOutOfStock: boolean;
  name: string;
  oldPrice?: string;
  options?: ProductOption;
  quantity: number;
  sku?: string;
  uidInCart: string;
  urlKey: string;
}

export const CheckoutProductCard = ({
  item,
}: {
  item: CheckoutProductCardItem;
}) => {
  const t = useTranslations("CheckoutPage.orderSummary");
  const tDelivery = useTranslations("CheckoutPage.delivery");

  const isGwp = item.isGwp;
  const isOutOfStock = item.isOutOfStock;
  const selectedOptionLabel = item.options?.choices?.[0]?.label;

  const productHref = getProductDetailsHref({
    sku: item.sku,
    urlKey: item.urlKey,
  });

  const { isPending: isRemovingItem, mutate: removeFromCart } =
    useRemoveProductFromCart({ sku: item.sku || "" });

  const handleRemoveFromCart = () => {
    removeFromCart({ itemUid: item.uidInCart });
  };

  return (
    <div className="h-22.5 relative flex items-center gap-3 rounded-xl border border-[#F3F3F3] p-3">
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
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="h-6.25 flex items-center justify-center gap-2.5 rounded-lg bg-black/50 px-2.5 py-2 text-[11px] font-medium leading-none text-white">
              {t("outOfStock")}
            </span>
          </div>
        )}
      </ProductDetailsLink>
      <ProductDetailsLink
        className="flex min-w-0 flex-1 flex-col text-sm"
        href={productHref || "#"}
        title={item.name}
      >
        <span className="text-text-primary line-clamp-1 text-xs font-semibold">
          {item.brand}
        </span>
        <span
          className={cn("text-text-primary line-clamp-1 text-xs font-normal", {
            "line-clamp-1": selectedOptionLabel,
          })}
        >
          {item.name}
        </span>
        {selectedOptionLabel && (
          <span className="text-text-secondary text-xs font-normal">
            {selectedOptionLabel}
          </span>
        )}
        <div className="mt-1 flex w-full items-center justify-between gap-2">
          <ProductCardPrice
            containerProps={{
              className: "px-0",
            }}
            countdownTimer={isGwp ? undefined : item.countdownTimer}
            oldPrice={isGwp ? undefined : item.oldPrice}
            price={isGwp ? tDelivery("free") : item.currentPrice}
          />
          {!isOutOfStock && (
            <span className="text-text-secondary shrink-0 text-xs font-normal">
              {t("quantity", {
                qty: item.quantity.toString(),
              })}
            </span>
          )}
        </div>
      </ProductDetailsLink>

      <div className="inset-s-1.5 absolute top-1.5 flex flex-row gap-0.5">
        {item.bulletDelivery && <StoreConfiguredProductCardBulletDelivery />}
      </div>

      {isOutOfStock && (
        <button
          aria-label="Remove product"
          className="inset-e-3 absolute bottom-3"
          disabled={isRemovingItem}
          onClick={handleRemoveFromCart}
          type="button"
        >
          {isRemovingItem ? (
            <Spinner className="size-3.75" size={15} variant="dark" />
          ) : (
            <Image
              alt="Remove product"
              className="size-3.75"
              height={15}
              src={TrashIcon}
              width={15}
            />
          )}
        </button>
      )}
    </div>
  );
};
