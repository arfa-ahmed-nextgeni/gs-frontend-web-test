"use client";

import { useEffect, useRef } from "react";

import { useTranslations } from "next-intl";

import { CartQuantityControl } from "@/components/cart/cart-quantity-control";
import { ProductCardBulletDelivery } from "@/components/product/product-card/product-card-bullet-delivery";
import { ProductCardDiscount } from "@/components/product/product-card/product-card-discount";
import { ProductCardLabel } from "@/components/product/product-card/product-card-label";
import { ProductCardPrice } from "@/components/product/product-card/product-card-price";
import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { ProductDetailsLink } from "@/components/shared/product-details-link";
import { useCart } from "@/contexts/use-cart";
import { useRemoveProductFromCart } from "@/hooks/mutations/cart/use-remove-product-from-cart";
import { useUpdateCartItemQuantity } from "@/hooks/mutations/cart/use-update-cart-item-quantity";
import { useBulletDeliveryEnabled } from "@/hooks/use-bullet-delivery-enabled";
import { trackCartLessQty, trackCartMoreQty } from "@/lib/analytics/events";
import {
  buildCartProperties,
  buildProductPropertiesFromCartItem,
} from "@/lib/analytics/utils/build-properties";
import { cn } from "@/lib/utils";
import { getProductDetailsHref } from "@/lib/utils/get-product-details-href";

export const CartLastAddedItem = () => {
  const { cart } = useCart();
  const t = useTranslations("CartPage");

  const lastAddedItem = cart?.items[0];
  const prevQuantityRef = useRef(lastAddedItem?.quantity || 0);

  // Update ref when item changes
  useEffect(() => {
    if (lastAddedItem) {
      prevQuantityRef.current = lastAddedItem.quantity;
    }
  }, [lastAddedItem]);

  const isBulletDeliveryEnabled = useBulletDeliveryEnabled();
  const { isPending, mutate: updateQuantity } = useUpdateCartItemQuantity();
  const { isPending: isRemovingItem, mutate: removeProductFromCart } =
    useRemoveProductFromCart({ sku: lastAddedItem?.sku || "" });

  const handleUpdateItemQuantity = (quantity: number) => {
    if (lastAddedItem) {
      const prevQuantity = prevQuantityRef.current;
      prevQuantityRef.current = quantity;

      updateQuantity({ itemUid: lastAddedItem.uidInCart, quantity });

      // Track cart_moreqty or cart_lessqty based on quantity change
      if (cart) {
        const cartProperties = buildCartProperties(cart);
        const productProperties =
          buildProductPropertiesFromCartItem(lastAddedItem);

        if (quantity > prevQuantity) {
          trackCartMoreQty(cartProperties, productProperties);
        } else if (quantity < prevQuantity) {
          trackCartLessQty(cartProperties, productProperties);
        }
      }
    }
  };

  const handleRemoveItem = () => {
    if (lastAddedItem) {
      removeProductFromCart({ itemUid: lastAddedItem.uidInCart });
    }
  };

  if (!lastAddedItem) {
    return null;
  }

  const discountPercent = lastAddedItem.discountPercent || null;
  const showBulletDelivery =
    Boolean(lastAddedItem.bulletDelivery) && isBulletDeliveryEnabled;
  const selectedOptionLabel = lastAddedItem.options?.choices?.[0]?.label;
  const itemQuantity = lastAddedItem.quantity;
  const isOutOfStock = lastAddedItem.isOutOfStock;
  const productHref = getProductDetailsHref({
    sku: lastAddedItem.sku,
    urlKey: lastAddedItem.urlKey,
  });

  const isLoadingQuantityControl = isPending || isRemovingItem;

  return (
    <div className="h-35 lg:h-52.5 bg-bg-default mx-5 flex flex-row rounded-2xl px-2.5 py-5 shadow-[0px_1px_0px_0px_rgba(243,243,243,1.00)] lg:px-5">
      <div className="max-w-25 lg:max-w-30 lg:w-30 flex w-[23.25vw] flex-col justify-between">
        <ProductDetailsLink
          className="relative aspect-square w-full overflow-hidden rounded-xl"
          href={productHref || "#"}
          title={lastAddedItem.name}
        >
          <ProductImageWithFallback
            alt="Product image"
            className="object-contain"
            fill
            sizes="(max-width: 430px) 23.25vw, 100px"
            src={lastAddedItem.imageUrl}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="h-6.25 flex items-center justify-center gap-2.5 rounded-lg bg-black/50 px-2.5 py-2 text-[11px] font-medium leading-none text-white">
                {t("outOfStock")}
              </span>
            </div>
          )}
        </ProductDetailsLink>
        <CartQuantityControl
          containerProps={{
            className: "hidden lg:flex",
          }}
          disableIncrement={isOutOfStock || lastAddedItem.isWrap}
          isLoading={isLoadingQuantityControl}
          onRemoveItemAction={handleRemoveItem}
          onUpdateQuantityAction={handleUpdateItemQuantity}
          quantity={itemQuantity}
        />
      </div>
      <div className="lg:ltr:ml-5! lg:rtl:mr-5! ms-2.5 flex flex-1 flex-col justify-between pe-2.5 lg:gap-4 lg:pe-0">
        <div className="flex flex-row justify-between gap-5 lg:flex-col lg:gap-2.5">
          <div className="hidden items-end justify-end gap-1 lg:flex">
            {showBulletDelivery && <ProductCardBulletDelivery />}
            {discountPercent && (
              <ProductCardDiscount discount={discountPercent} />
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <ProductDetailsLink
              className="block"
              href={productHref || "#"}
              title={lastAddedItem.name}
            >
              <p className="text-text-primary line-clamp-1 text-xs font-semibold">
                {lastAddedItem.brand}
              </p>
              <p className="text-text-primary line-clamp-1 text-xs font-normal">
                {lastAddedItem.name}
              </p>
            </ProductDetailsLink>
          </div>

          <div className="gap-1.25 flex flex-col lg:hidden">
            {(discountPercent || showBulletDelivery) && (
              <div className="flex flex-row gap-1">
                {showBulletDelivery && <ProductCardBulletDelivery />}
                {discountPercent && (
                  <ProductCardDiscount discount={discountPercent} />
                )}
              </div>
            )}
            {selectedOptionLabel && (
              <ProductCardLabel className="bg-label-muted">
                {selectedOptionLabel}
              </ProductCardLabel>
            )}
          </div>
        </div>

        <div className="hidden lg:flex">
          {selectedOptionLabel && (
            <ProductCardLabel className="bg-label-muted">
              {selectedOptionLabel}
            </ProductCardLabel>
          )}
        </div>

        <div
          className={cn("flex flex-row gap-2.5", {
            "animate-pulse": isLoadingQuantityControl,
          })}
        >
          <CartQuantityControl
            containerProps={{
              className: "flex max-w-30 w-[28vw] lg:hidden",
            }}
            disableIncrement={isOutOfStock || lastAddedItem.isWrap}
            isLoading={isLoadingQuantityControl}
            onRemoveItemAction={handleRemoveItem}
            onUpdateQuantityAction={handleUpdateItemQuantity}
            quantity={itemQuantity}
          />

          <ProductCardPrice
            containerProps={{
              className: "px-0 lg:pb-1.5",
            }}
            countdownTimer={lastAddedItem.countdownTimer}
            oldPrice={lastAddedItem.oldPrice}
            price={lastAddedItem.currentPrice}
          />
        </div>
      </div>
    </div>
  );
};
