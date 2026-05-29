import { useTranslations } from "next-intl";

import { ProductCardLabel } from "@/components/product/product-card/product-card-label";

export const ProductCardOutOfStock = () => {
  const t = useTranslations("productCard.badges");

  return (
    <ProductCardLabel className="bg-label-shadow transition-default relative z-20">
      {t("out_of_stock")}
    </ProductCardLabel>
  );
};
