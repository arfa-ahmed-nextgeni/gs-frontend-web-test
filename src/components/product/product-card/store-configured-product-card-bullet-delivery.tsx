"use client";

import { ProductCardBulletDelivery } from "@/components/product/product-card/product-card-bullet-delivery";
import { useBulletDeliveryEnabled } from "@/hooks/use-bullet-delivery-enabled";

export const StoreConfiguredProductCardBulletDelivery = () => {
  const isBulletDeliveryEnabled = useBulletDeliveryEnabled();

  if (!isBulletDeliveryEnabled) {
    return null;
  }

  return <ProductCardBulletDelivery />;
};
