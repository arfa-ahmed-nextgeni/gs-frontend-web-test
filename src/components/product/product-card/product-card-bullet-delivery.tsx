import Image from "next/image";

import RocketIcon from "@/assets/icons/rocket-icon.svg";
import { ProductCardLabel } from "@/components/product/product-card/product-card-label";

export const ProductCardBulletDelivery = () => {
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
