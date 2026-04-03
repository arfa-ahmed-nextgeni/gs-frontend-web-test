"use client";

import { useTranslations } from "next-intl";

import PartyHornIcon from "@/assets/icons/party-horn-icon.svg";
import { ProductDetailBadge } from "@/components/product/product-details/product-details-badge";
import { ProductDetailsBulletDeliveryBadge } from "@/components/product/product-details/product-details-bullet-delivery-badge";
import { ProductDetailsCashbackBadge } from "@/components/product/product-details/product-details-cashback-badge";
import { ProductDetailsCountdownBadge } from "@/components/product/product-details/product-details-countdown-badge";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { useProductDetails } from "@/contexts/product-details-context";

export const ProductDetailsBadges = () => {
  const { product, selectedVariantIndex } = useProductDetails();

  const t = useTranslations("ProductPage.badges");

  const savedPrice =
    product.variants[selectedVariantIndex]?.savedPrice || product.savedPrice;
  const lowStockMessage =
    product.variants[selectedVariantIndex]?.lowStockMessage ||
    product.lowStockMessage;

  return (
    <div className="gap-1.25 mt-3 flex flex-col lg:mt-4">
      <div className="gap-1.25 flex flex-row flex-wrap">
        {savedPrice && (
          <ProductDetailBadge
            bgColor="#6543F51A"
            icon={PartyHornIcon}
            iconAlt="party horn"
          >
            <span className="text-text-primary text-[11px] font-medium leading-none">
              {t.rich("savedPrice", {
                price: () => <LocalizedPrice price={savedPrice} />,
              })}
            </span>
          </ProductDetailBadge>
        )}
        <ProductDetailsCashbackBadge />
      </div>

      <div className="gap-1.25 flex flex-row flex-wrap">
        <ProductDetailsBulletDeliveryBadge />

        {!!lowStockMessage && (
          <ProductDetailBadge bgColor="#0000000D">
            <span className="text-text-primary text-[11px] font-medium leading-none">
              {lowStockMessage}
            </span>
          </ProductDetailBadge>
        )}
      </div>
      <div className="gap-1.25 flex flex-row flex-wrap">
        <ProductDetailsCountdownBadge />
      </div>
    </div>
  );
};
