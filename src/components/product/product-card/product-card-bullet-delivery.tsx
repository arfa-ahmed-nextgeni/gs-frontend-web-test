"use client";

import Image from "next/image";

import RocketIcon from "@/assets/icons/rocket-icon.svg";
import { ProductCardLabel } from "@/components/product/product-card/product-card-label";
import { useStoreConfig } from "@/contexts/store-config-context";
import { isBulletEnabledFromStores } from "@/lib/utils/bullet-delivery/eligibility";

export const ProductCardBulletDelivery = () => {
  const { storeConfig } = useStoreConfig();

  const bulletConfig = storeConfig?.bulletDeliveryConfig;

  const isEnabled = isBulletEnabledFromStores(storeConfig);

  if (!isEnabled || !bulletConfig) {
    return null;
  }

  return (
    <ProductCardLabel className="transition-default bg-label-alert-light px-2.5">
      <Image
        alt="Bullet delivery"
        className="aspect-square"
        height={12}
        src={RocketIcon}
        unoptimized
        width={12}
      />
    </ProductCardLabel>
  );
};
