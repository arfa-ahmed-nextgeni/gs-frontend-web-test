"use client";

import { useTransition } from "react";

import Image from "next/image";

import AddToBagDarkIcon from "@/assets/icons/add-to-bag-dark-icon.svg";
import { ProductCardPrice } from "@/components/product/product-card/product-card-price";
import { ProductCardStatusBadges } from "@/components/product/product-card/product-card-status-badges";
import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { Spinner } from "@/components/ui/spinner";
import { useAddProductToCart } from "@/hooks/mutations/cart/use-add-product-to-cart";
import { useBulletDeliveryEnabled } from "@/hooks/use-bullet-delivery-enabled";
import { Link, useRouter } from "@/i18n/navigation";
import { buildProductPropertiesFromCard } from "@/lib/analytics/utils/build-properties";
import { StockStatus } from "@/lib/constants/product/product-card";
import { ROUTES } from "@/lib/constants/routes";
import { ProductCardModel } from "@/lib/models/product-card-model";
import { cn } from "@/lib/utils";

interface ProductCardMiniProps {
  icon?: React.ReactNode;
  iconContainerClassName?: string;
  product: ProductCardModel;
}

export const ProductCardMini = ({
  icon,
  iconContainerClassName: iconButtonClassName,
  product,
}: ProductCardMiniProps) => {
  const router = useRouter();
  const isBulletDeliveryEnabled = useBulletDeliveryEnabled();
  const { isPending: isMovingToCart, mutate: addProductToCart } =
    useAddProductToCart({
      product: buildProductPropertiesFromCard(product),
      sku: product.sku || "",
    });
  const [isNavigatingToProduct, startNavigatingToProduct] = useTransition();
  const isConfigurable = !!product.options?.choices?.length;
  const isLoading = isMovingToCart || isNavigatingToProduct;

  const handleActionClick = () => {
    if (isLoading) {
      return;
    }

    if (isConfigurable) {
      if (!product.urlKey) {
        return;
      }

      startNavigatingToProduct(() => {
        router.push(ROUTES.PRODUCT.BY_URL_KEY(product.urlKey));
      });

      return;
    }

    if (!product.sku) {
      return;
    }

    addProductToCart({ sku: product.sku });
  };

  return (
    <div className="h-25 w-65.75 min-w-65.75 bg-bg-default relative flex flex-row items-stretch overflow-hidden rounded-xl shadow-sm">
      <div className="absolute top-0 z-10 scale-[0.85] ltr:origin-top-left rtl:origin-top-right">
        <ProductCardStatusBadges
          bulletDelivery={product.bulletDelivery}
          discountPercent={product.discountPercent}
          isBulletDeliveryEnabled={isBulletDeliveryEnabled}
          stockStatus={
            product.isOutOfStock ? StockStatus.OutOfStock : product.stockStatus
          }
        />
      </div>

      {/* Image */}
      <Link
        className="my-auto shrink-0 overflow-hidden rounded-xl"
        href={product.urlKey ? ROUTES.PRODUCT.BY_URL_KEY(product.urlKey) : "#"}
        title={product.name}
      >
        <ProductImageWithFallback
          alt={product.name}
          className="size-20 object-cover"
          height={80}
          src={product.imageUrl}
          width={80}
        />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between px-3 py-2">
        <div className="flex flex-col">
          <p className="text-text-primary line-clamp-1 text-xs font-semibold leading-snug">
            {product.name}
          </p>
          <p className="text-text-secondary line-clamp-2 text-[11px] font-normal leading-snug">
            {product.description}
          </p>
        </div>

        {/* Price + Add button */}
        <div className="flex flex-row items-center justify-between">
          <ProductCardPrice
            containerProps={{
              className: "px-0",
            }}
            oldPrice={product.oldPrice}
            oldPriceClassName="text-[11px]"
            price={product.currentPrice}
            priceClassName="text-sm font-semibold"
          />

          <button
            className={cn(
              "size-7.5 border-border-base bg-btn-bg-default flex items-center justify-center rounded-full border",
              product.stockStatus === StockStatus.OutOfStock && "invisible",
              iconButtonClassName
            )}
            disabled={isLoading}
            onClick={handleActionClick}
          >
            {isLoading ? (
              <Spinner className="size-3.75" size={15} variant="dark" />
            ) : (
              <Image
                alt="Move to cart"
                className="size-3.75"
                height={15}
                src={icon || AddToBagDarkIcon}
                width={15}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
