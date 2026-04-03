import { useTranslations } from "next-intl";

import { ProductCardLabel } from "@/components/product/product-card/product-card-label";

export const ProductCardOutOfStock = () => {
  const t = useTranslations("productCard.badges");

  return (
    <ProductCardLabel className="transition-default bg-label-shadow">
      {t("out_of_stock")}
    </ProductCardLabel>
  );
};
