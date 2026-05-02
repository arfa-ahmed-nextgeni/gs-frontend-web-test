"use client";

import { useRef } from "react";

import { CartQuantityControl } from "@/components/cart/cart-quantity-control";
import { CartItemWishlistButton } from "@/components/cart/order/cart-item-wishlist-button";
import { ProductCardDiscount } from "@/components/product/product-card/product-card-discount";
import { ProductCardLabel } from "@/components/product/product-card/product-card-label";
import { ProductCardPrice } from "@/components/product/product-card/product-card-price";
import { StoreConfiguredProductCardBulletDelivery } from "@/components/product/product-card/store-configured-product-card-bullet-delivery";
import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { ProductDetailsLink } from "@/components/shared/product-details-link";
import { useCart } from "@/contexts/use-cart";
import { useRemoveProductFromCart } from "@/hooks/mutations/cart/use-remove-product-from-cart";
import { useUpdateCartItemQuantity } from "@/hooks/mutations/cart/use-update-cart-item-quantity";
import { trackCartLessQty, trackCartMoreQty } from "@/lib/analytics/events";
import {
  buildCartProperties,
  buildProductPropertiesFromCartItem,
} from "@/lib/analytics/utils/build-properties";
import { CartItem as CartItemModel } from "@/lib/models/cart";
import { cn } from "@/lib/utils";
import { getProductDetailsHref } from "@/lib/utils/get-product-details-href";

export function CartItem({ item }: { item: CartItemModel }) {
  const { cart } = useCart();
  const prevQuantityRef = useRef(item.quantity);
  const { isPending, mutate: updateQuantity } = useUpdateCartItemQuantity();
  const { isPending: isRemovingItem, mutate: removeProductFromCart } =
    useRemoveProductFromCart({ sku: item.sku || "" });

  const handleUpdateItemQuantity = (quantity: number) => {
    const prevQuantity = prevQuantityRef.current;
    prevQuantityRef.current = quantity;

    updateQuantity({ itemUid: item.uidInCart, quantity });

    // Track cart_moreqty or cart_lessqty based on quantity change
    if (cart) {
      const cartProperties = buildCartProperties(cart);
      const productProperties = buildProductPropertiesFromCartItem(item);

      if (quantity > prevQuantity) {
        trackCartMoreQty(cartProperties, productProperties);
      } else if (quantity < prevQuantity) {
        trackCartLessQty(cartProperties, productProperties);
      }
    }
  };

  const handleRemoveItem = () => {
    removeProductFromCart({ itemUid: item.uidInCart });
  };

  const isLoading = isPending || isRemovingItem;
  const selectedOptionLabel = item.options?.choices?.[0]?.label;
  const discountPercent = item.discountPercent ?? null;
  const productHref = getProductDetailsHref({
    sku: item.sku,
    urlKey: item.urlKey,
  });

  return (
    <div className="border-border-base bg-bg-default lg:h-37.5 h-52.5 relative flex flex-row gap-5 overflow-hidden rounded-none border-b p-5 first:rounded-t-xl last:rounded-b-xl last:border-none lg:gap-2.5 lg:p-2.5">
      <div className="gap-1.25 absolute right-5 top-5 flex flex-row items-start rtl:left-5 rtl:right-auto">
        {item.bulletDelivery && <StoreConfiguredProductCardBulletDelivery />}
        {discountPercent && <ProductCardDiscount discount={discountPercent} />}
      </div>

      {/* Product Image */}
      <div className="w-32.5 lg:max-w-32.5 lg:w-32.5 flex flex-col justify-between gap-2">
        <ProductDetailsLink
          className="relative aspect-square w-full overflow-hidden rounded-xl"
          href={productHref || "#"}
          title={item.name}
        >
          {item.imageUrl && (
            <ProductImageWithFallback
              alt={item.name}
              className="object-contain"
              fill
              src={item.imageUrl}
            />
          )}
        </ProductDetailsLink>
        <CartQuantityControl
          containerProps={{ className: "flex w-full lg:hidden" }}
          disableIncrement={item.isWrap}
          isLoading={isLoading}
          onRemoveItemAction={handleRemoveItem}
          onUpdateQuantityAction={handleUpdateItemQuantity}
          quantity={item.quantity}
        />
      </div>

      {/* Info + Controls */}
      <div className="relative flex flex-1 flex-col justify-between">
        <div className="flex flex-1 flex-row justify-between gap-5 lg:flex-col lg:gap-2.5">
          <div className="flex h-full flex-1 flex-col justify-between lg:pb-2">
            {/* Product Info */}
            <ProductDetailsLink
              className="block"
              href={productHref || "#"}
              title={item.name}
            >
              <p className="text-text-primary pt-8.5 line-clamp-1 text-xs font-semibold lg:pt-2.5">
                {item.brand || item.name}
              </p>
              {item.name && (
                <p className="text-text-primary line-clamp-2 text-xs font-normal">
                  {item.name}
                </p>
              )}
            </ProductDetailsLink>
            <div className="flex">
              {
                <ProductCardLabel
                  className={cn(
                    "bg-label-muted mt-2",
                    !selectedOptionLabel && "invisible"
                  )}
                >
                  {selectedOptionLabel || ""}
                </ProductCardLabel>
              }
            </div>

            {/* Quantity + Price + Wishlist row */}
            <div className="flex items-center justify-between gap-3 lg:gap-5">
              <div className="flex items-center gap-5">
                <CartQuantityControl
                  containerProps={{
                    className: "flex max-w-30 w-30 hidden lg:flex",
                  }}
                  disableIncrement={item.isWrap}
                  isLoading={isLoading}
                  onRemoveItemAction={handleRemoveItem}
                  onUpdateQuantityAction={handleUpdateItemQuantity}
                  quantity={item.quantity}
                />
                <ProductCardPrice
                  containerProps={{ className: "mt-4 px-0 lg:pb-3" }}
                  countdownTimer={item.countdownTimer}
                  oldPrice={
                    item.oldPrice !== undefined
                      ? String(item.oldPrice)
                      : undefined
                  }
                  price={
                    item.currentPrice !== undefined
                      ? String(item.currentPrice)
                      : ""
                  }
                />
              </div>
              {/* Wishlist Button */}
              {!item.isWrap && (
                <div className="flex items-center justify-center pb-0 lg:mr-2.5 lg:pb-2 rtl:ml-2.5">
                  <CartItemWishlistButton item={item} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
