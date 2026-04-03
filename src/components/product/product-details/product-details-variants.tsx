"use client";

import { useTranslations } from "next-intl";

import { LocalizedPrice } from "@/components/shared/localized-price";
import { useProductDetails } from "@/contexts/product-details-context";
import { ProductType } from "@/lib/constants/product/product-details";
import { cn } from "@/lib/utils";

export const ProductDetailsVariants = () => {
  const { product, selectedVariantIndex, setSelectedVariantIndex } =
    useProductDetails();

  const t = useTranslations("ProductPage.variants");

  if (!product.variants.length) {
    return null;
  }

  if (product.type === ProductType.Beauty) {
    const colorOptions = product.variants.map(({ color, inStock, label }) => ({
      color,
      label,
      outOfStock: !inStock,
    }));

    return (
      <div className="flex flex-col gap-5">
        <p className="text-text-primary text-sm font-medium leading-none">
          {t("colorCode")} {colorOptions[selectedVariantIndex].label}
        </p>
        <div className="p-1.25 flex flex-wrap gap-2.5 overflow-x-auto">
          {colorOptions.map(({ color, outOfStock }, index) => (
            <button
              className={cn(
                "transition-default size-6.25 relative flex-shrink-0 rounded-sm",
                {
                  "outline-2 outline-offset-2 outline-[#2568F2]":
                    index === selectedVariantIndex,
                }
              )}
              key={index}
              onClick={() => setSelectedVariantIndex(index)}
              style={{
                backgroundColor: color,
              }}
              type="button"
            >
              {outOfStock && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-bg-primary h-[35px] w-0.5 origin-center rotate-45 transform rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2.5 overflow-x-auto">
      {product.variants.map(({ label, price }, index) => (
        <button
          className={cn(
            "transition-default max-w-22.75 h-15 border-border-base bg-bg-default flex w-[21.1vw] flex-shrink-0 flex-col items-center justify-center gap-2 rounded-[10px] border",
            {
              "bg-btn-bg-cool border-border-info":
                index === selectedVariantIndex,
            }
          )}
          key={index}
          onClick={() => setSelectedVariantIndex(index)}
          type="button"
        >
          <p className="text-text-primary text-lg font-semibold leading-none">
            {label}
          </p>
          <span className="text-text-placeholder text-sm font-medium leading-none">
            <LocalizedPrice price={price} />
          </span>
        </button>
      ))}
    </div>
  );
};
