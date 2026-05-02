import { ProductCardStatusBadges } from "@/components/product/product-card/product-card-status-badges";
import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { StockStatus } from "@/lib/constants/product/product-card";
import { cn } from "@/lib/utils";

import type { GiftWrappingProduct } from "@/components/checkout/delivery/gift-wrapping/types";

interface GiftWrappingCardProps {
  gift: GiftWrappingProduct;
  isSelected?: boolean;
  onSelect?: (giftId: string) => void;
}

export const GiftWrappingCard = ({
  gift,
  isSelected,
  onSelect,
}: GiftWrappingCardProps) => {
  return (
    <button
      className={cn(
        "bg-bg-default transition-default focus-visible:ring-border-primary/20 focus-visible:ring-offset-bg-default flex shrink-0 flex-col items-center rounded-[10px] border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "h-[208px] w-[140px] px-0 pt-0",
        isSelected ? "border-border-primary" : "border-border-base"
      )}
      onClick={() => onSelect?.(gift.id)}
      type="button"
    >
      <div className="relative h-[140px] w-[135px] shrink-0 overflow-hidden rounded-t-[10px]">
        <ProductImageWithFallback
          alt={gift.name}
          className="object-cover"
          fill
          priority={isSelected}
          sizes="140px"
          src={gift.imageUrl}
        />
        <ProductCardStatusBadges
          containerProps={{
            className: "z-10",
          }}
          isBulletDeliveryEnabled={false}
          stockStatus={
            gift.inStock ? StockStatus.InStock : StockStatus.OutOfStock
          }
        />
      </div>
      <div className="relative h-[43px] w-[110px] min-w-0">
        <div className="h-[26px] w-full">
          <p className="text-text-primary line-clamp-2 w-full break-words text-start text-[12px] font-normal leading-normal">
            {gift.name}
          </p>
        </div>
        <div className="absolute top-[36px] w-full text-start">
          <LocalizedPrice
            containerProps={{
              className: "text-text-danger text-[16px] font-semibold",
            }}
            price={gift.priceLabel}
          />
        </div>
      </div>
    </button>
  );
};
