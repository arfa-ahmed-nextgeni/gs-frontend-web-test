import { ComponentProps } from "react";

import { ProductCardBulletDelivery } from "@/components/product/product-card/product-card-bullet-delivery";
import { ProductCardDiscount } from "@/components/product/product-card/product-card-discount";
import { ProductCardOutOfStock } from "@/components/product/product-card/product-card-out-of-stock";
import { StockStatus } from "@/lib/constants/product/product-card";
import { cn } from "@/lib/utils";

export const ProductCardStatusBadges = ({
  bulletDelivery,
  containerProps,
  discountPercent,
  isBulletDeliveryEnabled,
  stockStatus,
}: {
  bulletDelivery?: boolean;
  containerProps?: ComponentProps<"div">;
  discountPercent?: null | number;
  isBulletDeliveryEnabled: boolean;
  stockStatus: StockStatus;
}) => {
  return (
    <div
      {...containerProps}
      className={cn(
        "absolute start-1.5 top-1.5 flex flex-row gap-0.5",
        containerProps?.className
      )}
    >
      {discountPercent && <ProductCardDiscount discount={discountPercent} />}
      {bulletDelivery && isBulletDeliveryEnabled && (
        <ProductCardBulletDelivery />
      )}
      {stockStatus === StockStatus.OutOfStock && <ProductCardOutOfStock />}
    </div>
  );
};
