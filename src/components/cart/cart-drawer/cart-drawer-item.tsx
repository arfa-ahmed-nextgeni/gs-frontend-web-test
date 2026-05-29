"use client";

import Image from "next/image";

import { useTranslations } from "next-intl";

import AddToBagIcon from "@/assets/icons/add-to-bag-icon.svg";
import TrashIcon from "@/assets/icons/trash-icon.svg";
import { ProductCardBulletDelivery } from "@/components/product/product-card/product-card-bullet-delivery";
import { ProductCardPrice } from "@/components/product/product-card/product-card-price";
import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { ProductDetailsLink } from "@/components/shared/product-details-link";
import { Spinner } from "@/components/ui/spinner";
import { useRemoveProductFromCart } from "@/hooks/mutations/cart/use-remove-product-from-cart";
import { useBulletDeliveryEnabled } from "@/hooks/use-bullet-delivery-enabled";
import { ProductOption } from "@/lib/models/product-card-model";
import { CountdownTimer } from "@/lib/types/product/countdown-timer";
import { cn } from "@/lib/utils";
import { getProductDetailsHref } from "@/lib/utils/get-product-details-href";

type CartDrawerItemBaseProps = {
  brand: string;
  bulletDelivery?: boolean;
  countdownTimer?: CountdownTimer | null;
  image: string;
  isGwp?: boolean;
  isOutOfStock?: boolean;
  name: string;
  oldPrice?: string;
  options?: ProductOption;
  price: string;
  sku?: string;
  uid: string;
  urlKey?: string;
};

type CartDrawerMiniProps =
  | ({
      quantity: number;
      variant: "cart";
    } & CartDrawerItemBaseProps)
  | ({
      variant: "suggested";
    } & CartDrawerItemBaseProps);

export const CartDrawerItem = (props: CartDrawerMiniProps) => {
  const {
    brand,
    bulletDelivery,
    countdownTimer,
    image,
    isGwp,
    isOutOfStock,
    name,
    oldPrice,
    options,
    price,
    sku,
    uid,
    urlKey,
    variant,
  } = props;
  const tDelivery = useTranslations("CheckoutPage.delivery");
  const tCart = useTranslations("CartPage");
  // Hooks
  const { isPending: isRemovingItem, mutate: removeFromCart } =
    useRemoveProductFromCart({ sku: sku || "" });
  const isBulletDeliveryEnabled = useBulletDeliveryEnabled();
  const showBulletDelivery = Boolean(bulletDelivery) && isBulletDeliveryEnabled;

  // Actions
  const handleRemoveFromCart = () => {
    removeFromCart({ itemUid: uid });
  };
  const selectedOptionLabel = options?.choices?.[0]?.label;
  const productHref = getProductDetailsHref({
    sku,
    urlKey,
  });
  const renderActionButton = () => {
    switch (variant) {
      case "cart":
        if (isGwp) return null;
        return (
          <button disabled={isRemovingItem} onClick={handleRemoveFromCart}>
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
        );
      case "suggested":
        return (
          <button className="size-7.5 border-border-base bg-btn-bg-default flex items-center justify-center rounded-full border">
            <Image
              alt="Add to bag"
              className="size-3.75"
              height={15}
              src={AddToBagIcon}
              width={15}
            />
          </button>
        );
    }
  };
  return (
    <div className="h-25 w-65.75 min-w-65.75 bg-bg-default gap-1.25 relative flex flex-row overflow-hidden rounded-xl">
      {showBulletDelivery && (
        <div className="inset-s-1.5 absolute top-1.5 z-10 scale-[0.85] ltr:origin-top-left rtl:origin-top-right">
          <ProductCardBulletDelivery />
        </div>
      )}
      {/* Image */}
      <ProductDetailsLink
        className="relative my-auto overflow-hidden rounded-xl"
        href={productHref || "#"}
        title={name}
      >
        <ProductImageWithFallback
          alt={name}
          className="size-20 object-cover"
          height={80}
          src={image}
          width={80}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="h-6.25 flex items-center justify-center gap-2.5 rounded-lg bg-black/50 px-2.5 py-2 text-[11px] font-medium leading-none text-white">
              {tCart("outOfStock")}
            </span>
          </div>
        )}
      </ProductDetailsLink>
      {/* Content */}
      <div
        className={cn("flex flex-1 flex-col justify-between py-3 pe-5", {
          "pb-2.5": variant === "suggested",
        })}
      >
        <ProductDetailsLink
          className="flex flex-col"
          href={productHref || "#"}
          title={name}
        >
          <p className="text-text-primary line-clamp-1 text-xs font-semibold">
            {brand}
          </p>
          <p
            className={cn(
              "text-text-primary line-clamp-1 text-xs font-normal",
              { "line-clamp-1": selectedOptionLabel }
            )}
          >
            {name}
          </p>
          {selectedOptionLabel && (
            <p className="text-text-secondary text-xs font-normal">
              {selectedOptionLabel}
            </p>
          )}
        </ProductDetailsLink>
        <div className="flex flex-row items-center justify-between">
          <span className="text-text-primary text-base font-semibold">
            <ProductCardPrice
              containerProps={{
                className: "px-0",
              }}
              countdownTimer={isGwp ? undefined : countdownTimer}
              oldPrice={isGwp ? undefined : oldPrice}
              price={isGwp ? tDelivery("free") : price}
            />
          </span>
          {renderActionButton()}
        </div>
      </div>
    </div>
  );
};
