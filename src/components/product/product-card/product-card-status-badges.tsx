import { ProductCardBulletDelivery } from "@/components/product/product-card/product-card-bullet-delivery";
import { ProductCardDiscount } from "@/components/product/product-card/product-card-discount";
import { ProductCardOutOfStock } from "@/components/product/product-card/product-card-out-of-stock";
import { StockStatus } from "@/lib/constants/product/product-card";

export const ProductCardStatusBadges = ({
  bulletDelivery,
  discountPercent,
  stockStatus,
}: {
  bulletDelivery?: boolean;
  discountPercent?: null | number;
  stockStatus: StockStatus;
}) => {
  return (
    <div className="absolute start-1.5 top-1.5 flex flex-row gap-0.5">
      {discountPercent && <ProductCardDiscount discount={discountPercent} />}
      {bulletDelivery && <ProductCardBulletDelivery />}
      {stockStatus === StockStatus.OutOfStock && <ProductCardOutOfStock />}
    </div>
  );
};
