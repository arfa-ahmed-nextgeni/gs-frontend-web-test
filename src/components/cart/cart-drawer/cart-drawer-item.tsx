"use client";

import Image from "next/image";

import AddToBagIcon from "@/assets/icons/add-to-bag-icon.svg";
import TrashIcon from "@/assets/icons/trash-icon.svg";
import { ProductCardPrice } from "@/components/product/product-card/product-card-price";
import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { ProductDetailsLink } from "@/components/shared/product-details-link";
import { Spinner } from "@/components/ui/spinner";
import { useRemoveProductFromCart } from "@/hooks/mutations/cart/use-remove-product-from-cart";
import { ProductOption } from "@/lib/models/product-card-model";
import { CountdownTimer } from "@/lib/types/product/countdown-timer";
import { cn } from "@/lib/utils";
import { getProductDetailsHref } from "@/lib/utils/get-product-details-href";

type CartDrawerItemBaseProps = {
  countdownTimer?: CountdownTimer | null;
  description: string;
  image: string;
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
    countdownTimer,
    description,
    image,
    name,
    oldPrice,
    options,
    price,
    sku,
    uid,
    urlKey,
    variant,
  } = props;
  // Hooks
  const { isPending: isRemovingItem, mutate: removeFromCart } =
    useRemoveProductFromCart({ sku: sku || "" });
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
    <div className="h-25 w-65.75 min-w-65.75 bg-bg-default gap-1.25 flex flex-row overflow-hidden rounded-xl">
      {/* Image */}
      <ProductDetailsLink
        className="my-auto overflow-hidden rounded-xl"
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
            {name}
          </p>
          <p
            className={cn(
              "text-text-primary line-clamp-2 text-xs font-normal",
              { "line-clamp-1": selectedOptionLabel }
            )}
          >
            {description}
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
              countdownTimer={countdownTimer}
              oldPrice={oldPrice}
              price={price}
            />
          </span>
          {renderActionButton()}
        </div>
      </div>
    </div>
  );
};
