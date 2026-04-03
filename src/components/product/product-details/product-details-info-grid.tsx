import React from "react";

import { useTranslations } from "next-intl";

import { ProductType } from "@/lib/constants/product/product-details";
import { ProductDetailsModel } from "@/lib/models/product-details-model";

const INFO = ["type", "intensity", "gender", "year"];

const BEAUTY_INFO = ["type", "area", "skinType", "coverage"];

export const ProductDetailsInfoGrid = ({
  product,
}: {
  product: ProductDetailsModel;
}) => {
  const t = useTranslations("ProductPage.info");

  const infoItems = product.type === ProductType.Beauty ? BEAUTY_INFO : INFO;
  const filteredInfoItems = infoItems.filter(
    (item) => product.productInfo[item as keyof typeof product.productInfo]
  );

  if (filteredInfoItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-bg-surface min-h-15 flex w-max flex-row rounded-xl py-2.5">
      {filteredInfoItems.map((item, index) => (
        <React.Fragment key={index}>
          <div className="max-w-24.25 flex w-[22.5vw] flex-col items-center justify-start gap-1">
            <p className="text-text-secondary line-clamp-1 text-center text-xs font-normal">
              {t.has(item as any) ? t(item as any) : item}
            </p>
            <p className="text-text-primary px-0.5 text-center text-sm font-medium">
              {product.productInfo[item as keyof typeof product.productInfo] ||
                "-"}
            </p>
          </div>
          {index !== filteredInfoItems.length - 1 && (
            <span className="w-0.25 border-border-light-gray my-auto h-4/5 border" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
